import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";

import {
  Container,
  Row,
  DropdownButton,
  Dropdown,
  Button,
} from "react-bootstrap";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";

import CharacterCard from "../components/CharacterCard";
import CollapsedCard from "../components/CollapsedCard";
import RandomChoiceModal from "../components/RandomChoiceModal";

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data);

// const production = "http://localhost:3000";
const production = "https://better-random-ssbu.herokuapp.com";
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
  const [collapsed, setCollapsed] = useState(false);
  const [chars, setChars] = React.useState([]);

  const initalData = props.char;
  const { data, error } = useSWR("/api/chars", fetcher, { initalData });

  function merge(a, b, prop) {
    var reduced = a.filter(
      (aitem) => !b.find((bitem) => aitem[prop] === bitem[prop])
    );
    return reduced.concat(b);
  }

  useEffect(() => {
    let localChars;
    if (typeof window !== "undefined" && data) {
      localChars = JSON.parse(localStorage.getItem("chars"));

      if (!localChars) {
        localStorage.setItem("chars", JSON.stringify(data));
        localChars = [];
      }
      const mergedLocalData = merge(data, localChars, "id");
      setChars(mergedLocalData);
    } else {
      setChars(data);
    }
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
      const starredItems = chars.filter((i) => i.starred);
      const unstarredItems = chars.filter((i) => !i.starred);
      setChars([...starredItems, ...unstarredItems]);
    }
  }, [sort]);

  const handleCardClick = (index) => {
    const newItems = [...chars];
    const item = chars[index];
    item.starred ? (item.starred = false) : (item.starred = true);
    localStorage.setItem("chars", JSON.stringify(newItems));
    setChars(newItems);
  };

  const handleSortClick = (sort) => setSort(sort);
  const handleCollapse = () => setCollapsed(!collapsed);
  const handleClose = () => setModalShow(false);
  const handleShow = () => setModalShow(true);

  if (error) return <div>Failed to load characters</div>;
  if (!chars) return <div>Loading...</div>;

  return (
    <Container className="md-container">
      <Head>
        <title>Random Fighter</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <Container>
        <h1>Random Fighter</h1>
        <Container>
          <Row className="justify-content-between align-items-center">
            <Button variant="primary" onClick={handleShow}>
              Choose Random!
            </Button>
            <DropdownButton menuAlign="right" variant="secondary" title="Sort">
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
          </Row>
          {collapsed ? (
            <Row className="justify-content-between">
              {chars.map((item, index) => (
                <CollapsedCard
                  key={index}
                  index={index}
                  onClick={() => handleCardClick(index)}
                  {...item}
                />
              ))}
            </Row>
          ) : (
            <Row className="justify-content-between">
              {chars.map((item, index) => (
                <CharacterCard
                  key={index}
                  index={index}
                  onClick={() => handleCardClick(index)}
                  {...item}
                />
              ))}
            </Row>
          )}
        </Container>
      </Container>
      {modalShow && (
        <RandomChoiceModal
          items={chars}
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      )}
    </Container>
  );
}
