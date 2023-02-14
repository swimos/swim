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

package swim.log;

import swim.annotations.Nullable;
import swim.expr.Evaluator;
import swim.expr.Term;
import swim.json.Json;
import swim.json.JsonWriterOptions;
import swim.waml.Waml;
import swim.waml.WamlWriterOptions;

final class LogEnv implements Term {

  @Override
  public @Nullable Term getMember(Evaluator evaluator, String key) {
    switch (key) {
      case "toJson": return TO_JSON_METHOD;
      case "toWaml": return TO_WAML_METHOD;
      case "toWamlBlock": return TO_WAML_BLOCK_METHOD;
      default: return Term.super.getMember(evaluator, key);
    }
  }

  static final LogEnv TERM = new LogEnv();

  private static final ToJsonMethod TO_JSON_METHOD = new ToJsonMethod();

  private static final ToWamlMethod TO_WAML_METHOD = new ToWamlMethod();

  private static final ToWamlBlockMethod TO_WAML_BLOCK_METHOD = new ToWamlBlockMethod();

}

final class ToJsonMethod implements Term {

  @Override
  public Term invoke(Evaluator evaluator, Term... args) {
    if (args.length >= 1) {
      final Term term = args[0].evaluate(evaluator);
      final Object object = term.isValidObject() ? term.objectValue() : null;
      if (object != null) {
        return Term.of(Json.toString(object, JsonWriterOptions.readable()));
      } else {
        return Term.of(term.formatValue());
      }
    } else {
      return Term.trap();
    }
  }

}

final class ToWamlMethod implements Term {

  @Override
  public Term invoke(Evaluator evaluator, Term... args) {
    if (args.length >= 1) {
      final Term term = args[0].evaluate(evaluator);
      final Object object = term.isValidObject() ? term.objectValue() : null;
      if (object != null) {
        return Term.of(Waml.toString(object, WamlWriterOptions.readable()));
      } else {
        return Term.of(term.formatValue());
      }
    } else {
      return Term.trap();
    }
  }

}

final class ToWamlBlockMethod implements Term {

  @Override
  public Term invoke(Evaluator evaluator, Term... args) {
    if (args.length >= 1) {
      final Term term = args[0].evaluate(evaluator);
      final Object object = term.isValidObject() ? term.objectValue() : null;
      if (object != null) {
        return Term.of(Waml.toBlockString(object, WamlWriterOptions.readable()));
      } else {
        return Term.of(term.formatValue());
      }
    } else {
      return Term.trap();
    }
  }

}
