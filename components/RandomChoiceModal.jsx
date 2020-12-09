import { useEffect } from "react";
import { Modal, Button, Spinner, Row } from "react-bootstrap";

export default function RandomChoiceModal(props) {
  const starred = props.items.filter((i) => i.starred);
  const [selected, setSelected] = React.useState({});
  const [countdown, setCountdown] = React.useState(true);

  const getRandItem = (arr, prev) => {
    const rand = Math.floor(Math.random() * arr.length);
    const item = arr[rand];
    if (item.id === prev.id) {
      return getRandItem(arr, prev);
    }
    return item;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSelected(getRandItem(starred, selected));
      // const item = starred[Math.floor(Math.random() * starred.length)];
      // if (item.id !== selected.id) {
      //   setSelected(item);
      // }
      // console.log(item);
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCountdown(false);
    }, 2000);

    if (!countdown) {
      clearInterval(interval);
      clearTimeout(timeout);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };

    // let counter = starred.length - 1;
    // const interval = setInterval(() => {
    //   if (counter > 0) {
    //     console.log(counter);
    //     setSelected(starred[counter - 1]);
    //     counter = counter - 1;
    //   } else {
    //     console.log(counter);
    //     console.log(starred[counter - 1]);
    //     setSelected(starred[counter - 1]);
    //     counter = starred.length;
    //   }
    // }, 100);

    // const timeout = setTimeout(() => {
    //   clearInterval(interval);
    //   setCountdown(false);
    // }, 5000);

    // if (!countdown) {
    //   clearInterval(interval);
    //   clearTimeout(timeout);
    // }

    // return () => {
    //   clearInterval(interval);
    //   clearTimeout(timeout);
    // };
  }, [countdown]);

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
          {starred.length > 0 ? (
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
        {starred.length > 0 ? (
          <Button disabled={countdown} onClick={() => setCountdown(true)}>
            Go Again
          </Button>
        ) : (
          ""
        )}
      </Modal.Footer>
    </Modal>
  );
}
