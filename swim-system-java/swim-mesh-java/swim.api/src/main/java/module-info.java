// Copyright 2015-2019 SWIM.AI inc.
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

/**
 * Agent programming interface.
 */
module swim.api {
  requires transitive swim.util;
  requires transitive swim.codec;
  requires transitive swim.structure;
  requires transitive swim.math;
  requires transitive swim.spatial;
  requires transitive swim.observable;
  requires transitive swim.streamlet;
  requires transitive swim.dataflow;
  requires transitive swim.http;
  requires transitive swim.ws;
  requires transitive swim.mqtt;
  requires transitive swim.warp;
  requires transitive swim.concurrent;
  requires transitive swim.io;

  exports swim.api;
  exports swim.api.agent;
  exports swim.api.auth;
  exports swim.api.client;
  exports swim.api.data;
  exports swim.api.downlink;
  exports swim.api.function;
  exports swim.api.http;
  exports swim.api.http.function;
  exports swim.api.lane;
  exports swim.api.lane.function;
  exports swim.api.plane;
  exports swim.api.policy;
  exports swim.api.ref;
  exports swim.api.service;
  exports swim.api.space;
  exports swim.api.store;
  exports swim.api.warp;
  exports swim.api.warp.function;
  exports swim.api.ws;
  exports swim.api.ws.function;
}
