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

package swim.waml.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.Term;
import swim.util.Assume;
import swim.waml.WamlForm;
import swim.waml.WamlParser;
import swim.waml.WamlTupleForm;

@Internal
public final class ParseWamlGroup extends Parse<Term> {

  final WamlParser parser;
  final WamlForm<?> form;
  final @Nullable Parse<?> parseBlock;

  public ParseWamlGroup(WamlParser parser, WamlForm<?> form,
                        @Nullable Parse<?> parseBlock) {
    this.parser = parser;
    this.form = form;
    this.parseBlock = parseBlock;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseWamlGroup.parse(input, this.parser, this.form, this.parseBlock);
  }

  public static Parse<Term> parse(Input input, WamlParser parser, WamlForm<?> form,
                                  @Nullable Parse<?> parseBlock) {
    if (parseBlock == null) {
      final WamlTupleForm<?, ?, ?, ?> tupleForm;
      if (form instanceof WamlTupleForm<?, ?, ?, ?>) {
        tupleForm = (WamlTupleForm<?, ?, ?, ?>) form;
      } else {
        tupleForm = form.tupleForm();
      }
      if (tupleForm != null) {
        parseBlock = parser.parseBlock(input, tupleForm);
      } else {
        parseBlock = parser.parseBlock(input, form);
      }
    } else {
      parseBlock = parseBlock.consume(input);
    }
    if (parseBlock.isDone()) {
      final Object value = parseBlock.get();
      final Term term = Assume.<WamlForm<Object>>conforms(form).intoTerm(value);
      if (value == term) {
        return Assume.conforms(parseBlock);
      } else {
        return Parse.done(term);
      }
    } else if (parseBlock.isError()) {
      return parseBlock.asError();
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlGroup(parser, form, parseBlock);
  }

}
