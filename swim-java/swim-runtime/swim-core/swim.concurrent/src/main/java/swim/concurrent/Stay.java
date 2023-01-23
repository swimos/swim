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

package swim.concurrent;

/**
 * Backpressure aware continuation.
 *
 * @see Cont
 */
public interface Stay<T> extends Cont<T> {

  /**
   * Invoked when the asynchronous operation needs to wait before proceeding.
   * Returns {@code true} if the operation should continue; returns
   * {@code false} if the operation should preemptively terminate and
   * {@link #trap(Throwable)} the continuation.
   */
  boolean stay(StayContext context, int backlog);

}
