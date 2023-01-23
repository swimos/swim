// Copyright 2015-2023 Swim.inc
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

import type {ComponentObserver} from "../component/ComponentObserver";
import type {Service} from "./Service";

/** @public */
export interface ServiceObserver<S extends Service = Service> extends ComponentObserver<S> {
  serviceWillAttachParent?(parent: Service, service: S): void;

  serviceDidAttachParent?(parent: Service, service: S): void;

  serviceWillDetachParent?(parent: Service, service: S): void;

  serviceDidDetachParent?(parent: Service, service: S): void;

  serviceWillInsertChild?(child: Service, target: Service | null, service: S): void;

  serviceDidInsertChild?(child: Service, target: Service | null, service: S): void;

  serviceWillRemoveChild?(child: Service, service: S): void;

  serviceDidRemoveChild?(child: Service, service: S): void;

  serviceWillReinsertChild?(child: Service, target: Service | null, service: S): void;

  serviceDidReinsertChild?(child: Service, target: Service | null, service: S): void;

  serviceWillMount?(service: S): void;

  serviceDidMount?(service: S): void;

  serviceWillUnmount?(service: S): void;

  serviceDidUnmount?(service: S): void;
}
