// Copyright 2015-2021 Swim inc.
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

import {TestOptions, Spec, Report, Exam} from "@swim/unit";
import type {AnyUri} from "@swim/uri";
import type {WarpClient} from "@swim/client";
import {MockServer} from "./MockServer";

export class ClientExam extends Exam {
  constructor(report: Report, spec: Spec, name: string, options: TestOptions) {
    super(report, spec, name, options);
  }

  mockServer<T>(callback: (server: MockServer, client: WarpClient,
                           resolve: (result?: T) => void,
                           reject: (reason?: unknown) => void) => void,
                hostUri?: AnyUri, client?: WarpClient): Promise<T | void> {
    const server = new MockServer(hostUri, client);
    return server.run(callback);
  }
}
