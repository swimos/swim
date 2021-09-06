// Copyright 2015-2021 Swim Inc.
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

import {AnyUri, Uri, UriQuery, AnyUriFragment, UriFragment} from "@swim/uri";

/** @hidden */
export interface MutableHistoryState {
  fragment: string | undefined;

  permanent: {[key: string]: string | undefined};

  ephemeral: {[key: string]: string | undefined};
}

export interface HistoryStateInit {
  fragment?: string;

  permanent?: {[key: string]: string | undefined};

  ephemeral?: {[key: string]: string | undefined};
}

export interface HistoryState {
  readonly fragment: string | undefined;

  readonly permanent: {readonly [key: string]: string | undefined};

  readonly ephemeral: {readonly [key: string]: string | undefined};
}

export const HistoryState = {} as {
  empty(): HistoryState;

  current(): MutableHistoryState;

  updated(delta: HistoryStateInit, state?: MutableHistoryState): MutableHistoryState;

  cloned(state: HistoryState): MutableHistoryState;

  fromUri(uri: AnyUri): HistoryState;

  fromUriFragment(fragment: AnyUriFragment): HistoryState;

  toUri(state: HistoryState): Uri;
};

HistoryState.empty = function (): HistoryState {
  return {
    fragment: void 0,
    permanent: {},
    ephemeral: {},
  };
};

HistoryState.current = function (): MutableHistoryState {
  try {
    return HistoryState.fromUri(window.location.href);
  } catch (e) {
    console.error(e);
    return {
      fragment: void 0,
      permanent: {},
      ephemeral: {},
    };
  }
};

HistoryState.updated = function (delta: HistoryStateInit,
                                 state?: MutableHistoryState): MutableHistoryState {
  if (state === void 0) {
    state = HistoryState.current();
  }
  if ("fragment" in delta) {
    state.fragment = delta.fragment;
  }
  for (const key in delta.permanent) {
    const value = delta.permanent[key];
    if (value !== void 0) {
      state.permanent[key] = value;
    } else {
      delete state.permanent[key];
    }
  }
  for (const key in delta.ephemeral) {
    const value = delta.ephemeral[key];
    if (value !== void 0) {
      state.ephemeral[key] = value;
    } else {
      delete state.ephemeral[key];
    }
  }
  return state;
};

HistoryState.cloned = function (oldState: HistoryState): MutableHistoryState {
  const newState: MutableHistoryState = {
    fragment: oldState.fragment,
    permanent: {},
    ephemeral: {},
  };
  for (const key in oldState.permanent) {
    newState.permanent[key] = oldState.permanent[key];
  }
  for (const key in oldState.ephemeral) {
    newState.ephemeral[key] = oldState.ephemeral[key];
  }
  return newState;
};

HistoryState.fromUri = function (uri: AnyUri): HistoryState {
  uri = Uri.fromAny(uri);
  const fragment = (uri as Uri).fragment;
  if (fragment.isDefined()) {
    return HistoryState.fromUriFragment(fragment);
  } else {
    return HistoryState.empty();
  }
};

HistoryState.fromUriFragment = function (fragment: AnyUriFragment): HistoryState {
  fragment = UriFragment.fromAny(fragment);
  let query = fragment.identifier !== void 0
            ? UriQuery.parse(fragment.identifier)
            : UriQuery.undefined();
  const state: MutableHistoryState = {
    fragment: void 0,
    permanent: {},
    ephemeral: {},
  };
  while (!query.isEmpty()) {
    const key = query.key;
    const value = query.value;
    if (key !== void 0) {
      state.permanent[key] = value;
    } else {
      state.fragment = value;
    }
    query = query.tail();
  }
  return state;
};

HistoryState.toUri = function (state: HistoryState): Uri {
  const queryBuilder = UriQuery.builder();
  if (state.fragment !== void 0) {
    queryBuilder.add(void 0, state.fragment);
  }
  for (const key in state.permanent) {
    const value = state.permanent[key]!;
    queryBuilder.add(key, value);
  }
  return Uri.fragment(UriFragment.create(queryBuilder.bind().toString()));
};
