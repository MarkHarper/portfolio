import { Dispatch, ReactElement, SetStateAction } from 'react';

export type Child = ReactElement | string | false | undefined;

export type Children = Child | Child[];

export type UiComponentProps = {
  className?: string;
  children: Children;
};

export type ReactSetter<T> = Dispatch<SetStateAction<T>>;

export type RenderChildProps<T> = Record<string, any> & T;
export type RenderChild<T> = (props: RenderChildProps<T>) => JSX.Element;
