import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { selectDateStart } from './recorder';
import { RootState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

export interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';

interface LoadReaquestAction extends Action<typeof LOAD_REQUEST> {}

const LOAD_SUCCESS = 'userEvents/load_success';

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}

const LOAD_FAILURE = 'userEvents/load_failure';

interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadReaquestAction | LoadSuccessAction | LoadFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: LOAD_REQUEST,
    });

    try {
      const response = await fetch('http://localhost:3001/events');
      const events: UserEvent[] = await response.json();

      dispatch({
        type: LOAD_SUCCESS,
        payload: { events },
      });
    } catch (e) {
      dispatch({
        type: LOAD_FAILURE,
        error: 'Failed to load events.',
      });
    }
  };

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
};

const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

const CREATE_REQUEST = 'userEvents/create_request';
const CREATE_SUCCESS = 'userEvents/create_success';
const CREATE_FAILURE = 'userEvents/create_failure';

const DELETE_SUCCESS = 'userEvents/delete_sucess';
const DELETE_FAILURE = 'userEvents/delete_failure';
const DELETE_REQUEST = 'userEvents/delete_request';
interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {}

interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent['id'];
  };
}
interface DeleteFailureAction extends Action<typeof DELETE_FAILURE> {}
interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}

export const deleteUserEvent =
  (
    id: UserEvent['id']
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    DeleteRequestAction | DeleteSuccessAction | DeleteFailureAction
  > =>
  async (dispatch, getState) => {
    console.log('inside deleteUserEvent');

    dispatch({
      type: DELETE_REQUEST,
    });
    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        },
      });

      if (response.ok) {
        dispatch({
          type: DELETE_SUCCESS,
          payload: { id },
        });
      }
    } catch (error) {
      dispatch({
        type: DELETE_FAILURE,
      });
    }
  };

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateRequestAction | CreateSuccessAction | CreateFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: CREATE_REQUEST,
    });
    console.log('inside createUserEvent');
    try {
      const dateStart = selectDateStart(getState());
      const event: Omit<UserEvent, 'id'> = {
        title: 'No title',
        dateStart: dateStart,
        dateEnd: new Date().toISOString(),
      };
      console.log('new event:', event);

      const response = await fetch(`http://localhost:3001/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const createdEvent: UserEvent = await response.json();

      dispatch({
        type: CREATE_SUCCESS,
        payload: { event: createdEvent },
      });
    } catch (error) {
      dispatch({
        type: CREATE_FAILURE,
      });
    }
  };

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state!.allIds.map((id) => state!.byIds[id]);
};

const UPDATE_REQUEST = 'userEvents/update_request';
interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}
const UPDATE_SUCESS = 'userEvents/update_success';
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCESS> {
  payload: {
    updatedEvent: UserEvent;
  };
}

export const updateUserEvent =
  (
    event: UserEvent
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    UpdateRequestAction | UpdateSuccessAction
  > =>
  async (dispatch) => {
    dispatch({
      type: UPDATE_REQUEST,
    });

    const response = await fetch(`http://localhost:3001/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    const updatedEvent: UserEvent = await response.json();

    // console.log(updatedEvent);
    if (updatedEvent) {
      dispatch({
        type: UPDATE_SUCESS,
        payload: {
          updatedEvent,
        },
      });
    }
  };

const userEventsReducer = (
  state: UserEventsState = initialState,
  action:
    | LoadSuccessAction
    | CreateSuccessAction
    | DeleteSuccessAction
    | UpdateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };

    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };

    case DELETE_SUCCESS:
      const { id } = action.payload;
      let newIds = { ...state.byIds };
      delete newIds[id];
      // console.log('state.byIds[id]:', state.byIds[id]);
      // console.log('newIDS:', newIds);
      // console.log('statebyid:', state.byIds);
      return {
        ...state,
        allIds: [...state.allIds.filter((oldid) => id !== oldid)],
        byIds: {
          ...newIds,
        },
      };
    case UPDATE_SUCESS:
      const { updatedEvent } = action.payload;
      const newByIds = { ...state.byIds };
      newByIds[updatedEvent.id] = updatedEvent;

      return {
        ...state,
        byIds: { ...newByIds },
      };
    default:
      return state;
  }
};

export default userEventsReducer;
