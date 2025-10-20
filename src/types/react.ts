import { ReactElement } from 'react';

type Child = ReactElement | string | false | undefined;

export type Children = Child | Child[];
