import React, { Fragment, useEffect } from 'react';
import './Calendar.css';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  selectUserEventsArray,
  loadUserEvents,
  UserEvent,
  deleteUserEvent,
} from '../../redux/user-events';
import EventItem from '../EventItem/EventItem';

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state),
});

const mapDispatch = {
  loadUserEvents: loadUserEvents,
  deleteUserEvent,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${month}-${day}`;
};

const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};

  const addToGroup = (dateKey: string, event: UserEvent) => {
    if (groups[dateKey] === undefined) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  };

  events.forEach((event) => {
    const dateStartKey = createDateKey(new Date(event.dateStart));
    const dateEndKey = createDateKey(new Date(event.dateEnd));

    addToGroup(dateStartKey, event);

    if (dateEndKey !== dateStartKey) {
      addToGroup(dateEndKey, event);
    }
  });
  return groups;
};

const Calendar: React.FC<Props> = ({
  events,
  loadUserEvents,
  deleteUserEvent,
}) => {
  useEffect(() => {
    loadUserEvents();
  }, [loadUserEvents]);

  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined;
  let sortedGroupKeys: string[] | undefined;

  if (events.length) {
    groupedEvents = groupEventsByDay(events);
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => +new Date(date2) - +new Date(date1)
    );
  }

  return groupedEvents && sortedGroupKeys ? (
    <div className="calendar">
      {sortedGroupKeys.map((dayKey) => {
        const events = groupedEvents![dayKey];
        const groupDate = new Date(dayKey);
        const day = groupDate.getDate();
        const month = groupDate.toLocaleDateString(undefined, {
          month: 'long',
        });
        return (
          <Fragment key={dayKey}>
            <div className="calendar-day">
              <div className="calendar-day-label">
                <span>
                  {day} {month}
                </span>
              </div>
              <div className="calendar-events">
                {events.map((event) => {
                  return (
                    <div key={event.id} className="calendar-event">
                      <EventItem event={event} />
                      <button
                        className="calendar-event-delete-button"
                        onClick={() => deleteUserEvent(event.id)}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default connector(Calendar);
