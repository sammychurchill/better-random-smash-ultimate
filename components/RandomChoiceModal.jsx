import { useEffect, useState } from "react";
import useCountDown from "react-countdown-hook";
import { Modal, Button, Spinner, Row, Image } from "react-bootstrap";
import Link from 'next'

const ModalContent = ({items, selected, timeLeft}) => {
  if (items.length < 0 ) {
    return <p>Please choose some characters ya dolt!</p>
  }

  if (!selected) {
    return <p>error</p>
  }

  return (
    <>
    {timeLeft === 0? <a href={selected.ufPage }  target="_blank">
          <Image src="https://ultimateframedata.com/favicon-32x32.png" roundedCircle />
          </a>: null}
        
     <img height="300vh" src={selected.thumbnailURL}></img>
     </>
    )
}


export default function RandomChoiceModal({items, onHide, ...rest}) {
  const getRandItem = (arr, prev) => {
    const rand = Math.floor(Math.random() * arr.length);
    const item = arr[rand];
    if (prev && item.id === prev.id) {
      return getRandItem(arr, prev);
    }
    return item;
  };

  const [selected, setSelected] = useState(getRandItem(items));
  const [coundownRunning, setCountdownRunning] = useState(false);
  const [timeLeft, { start, pause, resume, reset }] = useCountDown(2000, 190);

  useEffect(() => {
    setCountdownRunning(true);
    start();
  }, []);

  useEffect(() => {
    setSelected(getRandItem(items), selected);
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
      {...rest}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      dialogClassName="modal-50h"
      centered
    >
      <Modal.Body>
        
        <Row className="justify-content-center">
          <ModalContent selected={selected} items={items} timeLeft={timeLeft} />
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {items.length > 0 ? (
          <Button disabled={coundownRunning} onClick={() => handleGoAgain()}>
            Go Again
          </Button>
        ) : (
          ""
        )}
      </Modal.Footer>
    </Modal>
  );
}
