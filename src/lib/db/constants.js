export const DB_NAME = 'dihadi';
export const DB_VERSION = 2;

export const STORES = {
  HABITS: 'habits',
  ACTIONS: 'actions'
};

export const HABIT_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  COLOR: 'color',
  ICON: 'icon',
  RANK: 'rank',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

export const ACTION_COLUMNS = {
  HABIT_ID: 'habit_id',
  CREATED_AT: 'created_at',
  DATE: 'date'
};

export const INDEXES = {
  HABITS: {
    NAME: 'name',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  ACTIONS: {
    DATE_HABIT: 'date_habit'
  }
};
