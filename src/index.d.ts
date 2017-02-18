/// <reference types="react" />
import { ComponentClass } from 'react';
import * as t from 'io-ts';
import * as React from 'react';
export declare type PropType = t.InterfaceType<any> | t.RefinementType<t.InterfaceType<any>>;
export declare type Options = {
    strict?: boolean;
    children?: t.Type<any>;
};
export declare function getPropTypes(type: PropType, options?: Options): {
    __prop_types_ts(values: any, prop: string, displayName: string): Error | null;
};
export declare function props(type: PropType, options?: Options): (C: ComponentClass<any>) => void;
export declare const ReactElement: t.Type<React.ReactElement<any>>;
export declare const ReactChild: t.Type<React.ReactChild>;
export declare const ReactFragment: t.Type<React.ReactFragment>;
export declare const ReactNode: t.Type<React.ReactNode>;
