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

package swim.csv.schema;

import swim.util.Builder;

public abstract class CsvHeader<T, R, C> {
  public abstract int colCount();

  public abstract CsvCol<? extends C> getCol(int index);

  public abstract CsvCol<? extends C> overflowCol();

  public abstract CsvHeader<T, R, C> col(int index, CsvCol<? extends C> col);

  public abstract CsvHeader<T, R, C> col(int index, String name);

  public abstract CsvHeader<T, R, C> col(CsvCol<? extends C> col);

  public abstract CsvHeader<T, R, C> col(String name);

  public abstract Builder<C, R> rowBuilder();

  public abstract Builder<R, T> tableBuilder();
}
