import { Container, Row, Card, Button } from "react-bootstrap";

export default function CharacterCard(props) {
  const { title, thumbnailURL, starred, onClick } = props;

  return (
    <Card
      className="sml-card"
      onClick={onClick}
      text={starred ? "light" : "muted"}
      bg={starred ? "dark" : "light"}
    >
      <Card.Body>
        <Card.Title>{title}</Card.Title>
      </Card.Body>
    </Card>
  );
}
