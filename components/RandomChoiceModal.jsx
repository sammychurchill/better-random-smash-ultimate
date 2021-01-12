import { useEffect } from "react";
import useCountDown from "react-countdown-hook";
import { Modal, Button, Spinner, Row } from "react-bootstrap";

export default function RandomChoiceModal(props) {
  const getRandItem = (arr, prev) => {
    const rand = Math.floor(Math.random() * arr.length);
    const item = arr[rand];
    if (prev && item.id === prev.id) {
      return getRandItem(arr, prev);
    }
    return item;
  };

  const [selected, setSelected] = React.useState(getRandItem(props.items));
  const [coundownRunning, setCountdownRunning] = React.useState(false);
  const [timeLeft, { start, pause, resume, reset }] = useCountDown(2000, 190);

  useEffect(() => {
    setCountdownRunning(true);
    start();
  }, []);

  useEffect(() => {
    setSelected(getRandItem(props.items), selected);
    if (timeLeft === 0) {
      setCountdownRunning(false);
    }
  }, [timeLeft]);

  const handleGoAgain = () => {
    setCountdownRunning(true);
    start(2000);
  };

  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      dialogClassName="modal-50h"
      centered
    >
      <Modal.Body>
        <Row className="justify-content-center">
          {props.items.length > 0 ? (
            selected && <img height="300vh" src={selected.thumbnailURL}></img>
          ) : (
            <p>Please choose some characters ya dolt!</p>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>
          Close
        </Button>
        {props.items.length > 0 ? (
          <Button disabled={coundownRunning} onClick={() => handleGoAgain()}>
            Go Again
            {/* {timeLeft} */}
          </Button>
        ) : (
          ""
        )}
      </Modal.Footer>
    </Modal>
  );
}
