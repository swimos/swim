// Copyright 2015-2022 Swim.inc
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
 * Swim system interfaces.
 */
module swim.system {
  requires swim.util;
  requires transitive swim.codec;
  requires transitive swim.structure;
  requires transitive swim.math;
  requires transitive swim.spatial;
  requires transitive swim.http;
  requires transitive swim.mqtt;
  requires transitive swim.warp;
  requires transitive swim.concurrent;
  requires transitive swim.api;
  requires transitive swim.store;

  exports swim.system;
  exports swim.system.agent;
  exports swim.system.downlink;
  exports swim.system.http;
  exports swim.system.lane;
  exports swim.system.profile;
  exports swim.system.reflect;
  exports swim.system.router;
  exports swim.system.scope;
  exports swim.system.warp;
}
