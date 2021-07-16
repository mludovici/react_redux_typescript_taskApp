import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UserEvent, updateUserEvent } from '../../redux/user-events';

interface Props {
  event: UserEvent;
}

const EventItem: React.FC<Props> = ({ event }) => {
  const [editable, setEditable] = useState(false);
  const [inputText, setInputText] = useState(event.title);
  const dispatch = useDispatch();

  const handleTitleClick = () => {
    setEditable(true);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    if (inputText !== event.title) {
      const newEvent = {
        ...event,
        title: inputText,
      };
      dispatch(updateUserEvent(newEvent));
    }

    setEditable(false);
  };

  useEffect(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  return (
    <div className="calendar-event-info">
      <div className="calendar-event-time">10:00 - 12:00</div>
      <div className="calendar-event-title">
        {editable ? (
          <input
            type="text"
            ref={inputRef}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onBlur={handleBlur}
          />
        ) : (
          <span onClick={handleTitleClick}>{inputText}</span>
        )}
      </div>
    </div>
  );
};

export default EventItem;
