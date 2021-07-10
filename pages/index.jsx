import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";

import {
  Container,
  CardColumns,
  Modal,
  DropdownButton,
  Dropdown,
  Button,
  Navbar,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";

import CharacterCard from "../components/CharacterCard";
import CollapsedCard from "../components/CollapsedCard";
import RandomChoiceModal from "../components/RandomChoiceModal";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// const production = "http://localhost:3000";
const production = "https://better-random-smash-ultimate.vercel.app/";
const development = "http://localhost:3000";
const URL_BASE =
  process.env.NODE_ENV === "development" ? development : production;

export async function getServerSideProps() {
  const data = await fetcher(URL_BASE + "/api/chars");
  return { props: { data } };
}

export default function Home(props) {
  const initalData = props.char;
  const { data, error } = useSWR("/api/chars", fetcher, { initalData });

  // State setup
  const [sort, setSort] = useState(["alpha"]);
  const [modalShow, setModalShow] = useState(false);
  const [newListModalShow, setNewListModalShow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chars, setChars] = useState([]);
  const [newListValue, setNewListValue] = useState("");

  function localSelectedList() {
    let localSelectedList;
    if (typeof window !== "undefined") {
      localSelectedList = localStorage.getItem("selectedList");
      return localSelectedList || "Default";
    }
  }
  const [selectedList, setSelectedList] = useState(localSelectedList());
// test1
  function getLocalLists() {
    let lists;
    if (typeof window !== "undefined") {
      lists = JSON.parse(localStorage.getItem("lists"));
    }
    if (!lists || lists.length === 0) {
      lists = { Default: [] };
    }
    return lists;
  }
  const [lists, setLists] = useState(getLocalLists());

  // Effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lists", JSON.stringify(lists));
    }
  }, [lists]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedList", selectedList);
    }
  }, [selectedList]);

  useEffect(() => {
    setChars(data);
  }, [data]);

  useEffect(() => {
    if (sort === "alpha") {
      const newItems = [...chars];
      newItems.sort((a, b) => {
        const textA = a.title.toUpperCase();
        const textB = b.title.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      setChars(newItems);
    } else {
      let starredItems = [];
      let unstarredItems = [];
      chars.forEach((item) => {
        if (lists[selectedList].includes(item.id)) {
          starredItems.push(item);
        } else {
          unstarredItems.push(item);
        }
      });
      setChars([...starredItems, ...unstarredItems]);
    }
  }, [sort]);

  // Event handlers
  const handleCardClick = (id) => {
    const newLists = { ...lists };
    let newList = [...newLists[selectedList]];
    if (newList.includes(id)) {
      newList = newList.filter((item) => item != id);
    } else {
      newList.push(id);
    }
    newLists[selectedList] = newList;
    setLists(newLists);
  };

  const handleSortClick = (sort) => setSort(sort);
  const handleCollapse = () => setCollapsed(!collapsed);
  const handleClose = () => setModalShow(false);
  const handleShow = () => setModalShow(true);
  const handleNewListShow = () => setNewListModalShow(true);
  const handleNewListClose = () => setNewListModalShow(false);
  const handleNewListValueChange = (e) => setNewListValue(e.target.value);
  const handleListChange = (listName) => setSelectedList(listName);

  const handleNewListSave = () => {
    const newLists = { ...lists };
    newLists[newListValue] = [];
    setLists(newLists);
    setSelectedList(newListValue);
    setNewListValue("");
    setNewListModalShow(false);
  };

  const handleListDeleteClick = () => {
    const newLists = { ...lists };
    console.log(Object.keys(newLists).length);
    if (Object.keys(newLists).length <= 1) {
      newLists["Default"] = [];
    } else {
      delete newLists[selectedList];
    }
    setLists(newLists);
    setSelectedList(Object.keys(newLists)[0]);
  };

  // Rendering
  if (error) return <div>Failed to load characters</div>;
  if (!chars) return <div>Loading...</div>;

  return (
    <>
      <Container>
        <Row>
          <h1>Random Fighter</h1>
        </Row>
        <Row className="align-items-center">
          <Col>
            <DropdownButton title="Choose List">
              {Object.keys(lists).map((list) => (
                <Dropdown.Item onClick={() => handleListChange(list)}>
                  {list}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleNewListShow}>Add New</Dropdown.Item>
            </DropdownButton>
          </Col>
          <Col>
            <Row className="justify-content-end">
              <h4>{selectedList}</h4>
              <MdDeleteForever
                size="32"
                onClick={handleListDeleteClick}
              ></MdDeleteForever>
            </Row>
          </Col>
        </Row>
      </Container>
      <Navbar sticky="bottom" fixed="bottom" variant="light" bg="light">
        <Container fluid>
          <Button variant="primary" onClick={handleShow}>
            Choose Random!
          </Button>
          <DropdownButton
            drop="up"
            menuAlign="right"
            variant="secondary"
            title="Sort"
          >
            <Dropdown.Item onClick={() => handleSortClick("alpha")}>
              Alphabetically
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSortClick("starred")}>
              Liked
            </Dropdown.Item>
          </DropdownButton>
          {collapsed ? (
            <h3>
              <BsArrowsExpand onClick={handleCollapse} />
            </h3>
          ) : (
            <h3>
              <BsArrowsCollapse onClick={handleCollapse} />
            </h3>
          )}
        </Container>
      </Navbar>
      <Container>
        <Head>
          <title>Random Fighter</title>
          <link rel="icon" href="/favicon-32x32.png" />
        </Head>

        <Container>
          {collapsed ? (
            <CardColumns className="justify-content-between">
              {chars.map((item, index) => (
                <CollapsedCard
                  key={index}
                  index={index}
                  onClick={() => handleCardClick(item.id)}
                  starred={lists[selectedList].includes(item.id)}
                  {...item}
                />
              ))}
            </CardColumns>
          ) : (
            <CardColumns className="justify-content-between">
              {chars.map((item, index) => (
                <CharacterCard
                  key={index}
                  index={index}
                  onClick={() => handleCardClick(item.id)}
                  starred={lists[selectedList].includes(item.id)}
                  {...item}
                />
              ))}
            </CardColumns>
          )}
        </Container>
        {modalShow && (
          <RandomChoiceModal
            items={chars.filter((item) =>
              lists[selectedList].includes(item.id)
            )}
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        )}
        {newListModalShow && (
          <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            dialogClassName="modal-50h"
            centered
            show={newListModalShow}
          >
            <Modal.Body>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>New List Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newListValue}
                  onChange={handleNewListValueChange}
                  placeholder="Main/Bad Boyz/Sad boys"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleNewListClose}>
                Close
              </Button>
              <Button
                disabled={newListValue.length < 1}
                onClick={handleNewListSave}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
}
