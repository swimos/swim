// Copyright 2015-2024 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Lazy} from "@swim/util";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import {UriQuery} from "@swim/uri";
import type {UriFragmentLike} from "@swim/uri";
import {UriFragment} from "@swim/uri";

/** @public */
export interface HistoryStateInit {
  fragment?: string;

  parameters?: {[key: string]: string | undefined};

  environment?: {[key: string]: any};
}

/** @internal */
export interface MutableHistoryState {
  fragment: string | undefined;

  parameters: {[key: string]: string | undefined};

  environment: {[key: string]: any};
}

/** @public */
export interface HistoryState {
  readonly fragment: string | undefined;

  readonly parameters: {readonly [key: string]: string | undefined};

  readonly environment: {readonly [key: string]: any};
}

/** @public */
export const HistoryState = {
  /** @internal */
  empty: Lazy(function (): HistoryState {
    return Object.freeze({
      fragment: void 0,
      parameters: {},
      environment: {},
    });
  }),

  /** @internal */
  current(): MutableHistoryState {
    try {
      return HistoryState.fromUri(window.location.href);
    } catch (e) {
      console.error(e);
      return HistoryState.empty();
    }
  },

  /** @internal */
  updated(delta: HistoryStateInit, state?: MutableHistoryState): MutableHistoryState {
    if (state === void 0) {
      state = HistoryState.current();
    }
    if ("fragment" in delta) {
      state.fragment = delta.fragment;
    }
    for (const key in delta.parameters) {
      const value = delta.parameters[key];
      if (value !== void 0) {
        state.parameters[key] = value;
      } else {
        delete state.parameters[key];
      }
    }
    for (const key in delta.environment) {
      const value = delta.environment[key];
      if (value !== void 0) {
        state.environment[key] = value;
      } else {
        delete state.environment[key];
      }
    }
    return state;
  },

  /** @internal */
  cloned(oldState: HistoryState): MutableHistoryState {
    const newState: MutableHistoryState = {
      fragment: oldState.fragment,
      parameters: {},
      environment: {},
    };
    for (const key in oldState.parameters) {
      newState.parameters[key] = oldState.parameters[key];
    }
    for (const key in oldState.environment) {
      newState.environment[key] = oldState.environment[key];
    }
    return newState;
  },

  /** @internal */
  fromUri(uri: UriLike): HistoryState {
    uri = Uri.fromLike(uri);
    const fragment = uri.fragment;
    if (!fragment.isDefined()) {
      return HistoryState.empty();
    }
    return HistoryState.fromUriFragment(fragment);
  },

  /** @internal */
  fromUriFragment(fragment: UriFragmentLike): HistoryState {
    fragment = UriFragment.fromLike(fragment);
    let query = fragment.identifier !== void 0
              ? UriQuery.parse(fragment.identifier)
              : UriQuery.undefined();
    const state: MutableHistoryState = {
      fragment: void 0,
      parameters: {},
      environment: {},
    };
    while (!query.isEmpty()) {
      const key = query.key;
      const value = query.value;
      if (key !== void 0) {
        state.parameters[key] = value;
      } else {
        state.fragment = value;
      }
      query = query.tail();
    }
    return state;
  },

  /** @internal */
  toUri(state: HistoryState): Uri {
    const queryBuilder = UriQuery.builder();
    if (state.fragment !== void 0) {
      queryBuilder.add(void 0, state.fragment);
    }
    for (const key in state.parameters) {
      const value = state.parameters[key]!;
      queryBuilder.add(key, value);
    }
    return Uri.fragment(UriFragment.create(queryBuilder.build().toString()));
  },
};
