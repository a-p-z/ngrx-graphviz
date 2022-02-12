export interface IEffect$ {
  causes: string[];
  dispatch: boolean;
  effect$: string;
  effects: string[];
  errors: string[];
}

export interface INavListItem {
  id: string;
  label: string;
}

export interface IReducer {
  action: string;
  reducer: string;
}

export interface ISourceFile {
  path: string;
  text: string;
}
