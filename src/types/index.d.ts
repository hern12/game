import { StyleRules, StyleRulesCallback } from '@material-ui/core/styles';

export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type ClassKeys<T> = T extends string ? T : T extends StyleRulesCallback<infer K> ? K : T extends StyleRules<infer K> ? K : never;
