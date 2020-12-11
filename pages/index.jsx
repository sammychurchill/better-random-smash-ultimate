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
  const [sort, setSort] = useState(["alpha"]);
  const [modalShow, setModalShow] = React.useState(false);
  const [newListModalShow, setNewListModalShow] = React.useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chars, setChars] = React.useState([]);
  const [lists, setLists] = React.useState([]);
  const [newListValue, setNewListValue] = React.useState("");

  const initalData = props.char;
  const { data, error } = useSWR("/api/chars", fetcher, { initalData });

  let onLoadSelectedList;
  if (typeof window !== "undefined") {
    onLoadSelectedList = localStorage.getItem("selectedList");
    if (!lists.includes(onLoadSelectedList)) {
      localStorage.removeItem(onLoadSelectedList);
      onLoadSelectedList = null;
    }
  }

  const [selectedList, setSelectedList] = React.useState(
    onLoadSelectedList || "Default"
  );

  function merge(a, b, prop) {
    var reduced = a.filter(
      (aitem) => !b.find((bitem) => aitem[prop] === bitem[prop])
    );
    return reduced.concat(b);
  }

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("lists", JSON.stringify(lists));
  //   }
  // }, [lists]);

  useEffect(() => {
    let localChars;
    let localLists;
    if (typeof window !== "undefined") {
      if (data) {
        localChars = JSON.parse(localStorage.getItem(selectedList));
        if (!localChars) {
          localStorage.setItem(selectedList, JSON.stringify(data));
          localChars = [];
        }
        const mergedLocalData = merge(data, localChars, "id");
        setChars(mergedLocalData);
      } else {
        setChars(data);
      }

      localLists = JSON.parse(localStorage.getItem("lists"));
      if (!localLists || localLists.length === 0) {
        localLists = ["Default"];
        localStorage.setItem("lists", JSON.stringify(localLists));
      }
      setLists(localLists);

      localStorage.setItem("selectedList", selectedList);
    }
  }, [data, selectedList]);

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
      const starredItems = chars.filter((i) => i.starred);
      const unstarredItems = chars.filter((i) => !i.starred);
      setChars([...starredItems, ...unstarredItems]);
    }
  }, [sort]);

  const handleCardClick = (index) => {
    const newItems = [...chars];
    const item = chars[index];
    item.starred ? (item.starred = false) : (item.starred = true);
    localStorage.setItem(selectedList, JSON.stringify(newItems));
    setChars(newItems);
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
    const newLists = [newListValue, ...lists];
    console.log(newLists);
    setLists(newLists);
    localStorage.setItem("lists", JSON.stringify(newLists));
    setSelectedList(newListValue);
    setNewListValue("");
    setNewListModalShow(false);
    setChars(chars.map((c) => (c.starred = false)));
  };

  const handleListDeleteClick = () => {
    const newLists = lists.filter((l) => l !== selectedList);
    localStorage.removeItem(selectedList);
    setSelectedList(newLists[0] || "Default");
    setLists(newLists);
    localStorage.setItem("lists", JSON.stringify(newLists));
  };

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
              {lists.map((list) => (
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
                  onClick={() => handleCardClick(index)}
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
                  onClick={() => handleCardClick(index)}
                  {...item}
                />
              ))}
            </CardColumns>
          )}
        </Container>
        {modalShow && (
          <RandomChoiceModal
            items={chars}
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
              <Button onClick={handleNewListSave}>Save</Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
}
