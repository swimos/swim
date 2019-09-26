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

package swim.dataflow;

import swim.structure.Record;
import swim.structure.Value;
import swim.util.Require;

/**
 * Utilities to create identifying tags for states stored by stream elements.
 */
final class StateTags {

  private StateTags() { }

  static final String TAG = "StateKey";
  static final String PERIOD_SUFFIX = "period";
  static final String MODE_SUFFIX = "mode";
  static final String STATE_SUFFIX = "state";

  static final String NAME_PROP = "element";
  static final String KIND_PROP = "kind";
  static final String KEY_PROP = "key";

  /**
   * Create a tag for a state.
   * @param baseName Name uniquely identifying the stream element.
   * @param suffix Name to distinguish multiple states for a single element.
   * @return The tag.
   */
  private static Value createTag(final String baseName, final String suffix) {
    Require.that(baseName != null, "The base name must be non-null.");
    return Record.create(1).attr(TAG, Record.create(2)
        .slot(NAME_PROP, baseName)
        .slot(KIND_PROP, suffix));
  }

  /**
   * Create a tag for a state that stores the frequency of updates for an element.
   * @param baseName Name uniquely identifying the stream element.
   * @return The tag.
   */
  public static Value periodTag(final String baseName) {
    return createTag(baseName, PERIOD_SUFFIX);
  }

  /**
   * Create a tag for a state that stores the current mode of a modal element.
   * @param baseName Name uniquely identifying the stream element.
   * @return The tag.
   */
  public static Value modeTag(final String baseName) {
    return createTag(baseName, MODE_SUFFIX);
  }

  /**
   * Create a tag for a state that stores the current state of a stateful element.
   * @param baseName Name uniquely identifying the stream element.
   * @return The tag.
   */
  public static Value stateTag(final String baseName) {
    return createTag(baseName, STATE_SUFFIX);
  }

  /**
   * Create a tag for an element that requires an arbitrary number of states.
   * @param baseName Name uniquely identifying the stream element.
   * @param key Key to distinguish the states of this element.
   * @return THe tag.
   */
  public static Value keyedStateTag(final String baseName, final Value key) {
    Require.that(baseName != null, "The base name must be non-null.");
    Require.that(key != null, "The key must be non-null.");
    return Record.create(1).attr(TAG, Record.create(3)
        .slot(NAME_PROP, baseName)
        .slot(KIND_PROP, STATE_SUFFIX)
        .slot(KEY_PROP, key));
  }

}
