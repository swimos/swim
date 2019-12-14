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

package swim.dataflow.graph.impl;

import swim.concurrent.Schedule;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.PersistenceProvider;

/**
 * Factory for {@link SwimStreamContext}s.
 */
public final class Graphs {

  private Graphs() { }

  public static SwimStreamContext createContext(final Schedule schedule,
                                                final PersistenceProvider persistence) {
    return new ContextImpl(schedule, persistence);
  }

  public static SwimStreamContext.InitContext createInitContext(final Schedule schedule,
                                                                final PersistenceProvider persistence) {
    return new ContextImpl.InitContextImpl(schedule, persistence);
  }

}
