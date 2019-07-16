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

package swim.concurrent;

/**
 * Continuation of an asynchronous operation.  The {@link #bind(Object)
 * bind(T)} method gets called when the asynchronous operation completes with a
 * value; the {@link #trap(Throwable)} method gets called when the asynchronous
 * operation fails with an exception.
 *
 * @see Conts
 * @see Call
 * @see Sync
 */
public interface Cont<T> {
  /**
   * Invoked when the asynchronous operation completes with a {@code value}.
   */
  void bind(T value);

  /**
   * Invoked when the asynchronous operation fails with an {@code error}.
   */
  void trap(Throwable error);
}
