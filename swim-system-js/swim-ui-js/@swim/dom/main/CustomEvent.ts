// Copyright 2015-2020 SWIM.AI inc.
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

const CustomEventConstructor: {new (type: string, init: CustomEventInit): CustomEvent} =
  function (this: CustomEvent, type: string, init: CustomEventInit = {}): CustomEvent {
    const event = document.createEvent("CustomEvent") as CustomEvent;
    event.initCustomEvent(type, init.bubbles || false, init.cancelable || false, init.detail);
    (event as any).__proto__ = (this as any).__proto__;
    return event;
  } as any;
if (typeof Event !== "undefined") {
  CustomEventConstructor.prototype = Event.prototype;
}

export {CustomEventConstructor as CustomEvent};
