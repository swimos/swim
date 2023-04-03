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

package swim.expr;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.term.SeverityTerm;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class SwimTerms implements TermProvider, ToSource {

  final int priority;

  private SwimTerms(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable TermForm<?> resolveTermForm(Type javaType) throws TermFormException {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (Severity.class.isAssignableFrom(javaClass)) {
        return SwimTerms.severityForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SwimTerms", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final SwimTerms PROVIDER = new SwimTerms(BUILTIN_PRIORITY);

  public static SwimTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new SwimTerms(priority);
    }
  }

  public static SwimTerms provider() {
    return PROVIDER;
  }

  public static TermForm<Severity> severityForm() {
    return SwimTerms.SeverityForm.INSTANCE;
  }

  static final class SeverityForm implements TermForm<Severity>, ToSource {

    @Override
    public Term intoTerm(@Nullable Severity value) {
      if (value == null) {
        return Term.of();
      }
      return SeverityTerm.of(value);
    }

    @Override
    public @Nullable Severity fromTerm(Term term) {
      return term.objectValue(Severity.class);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("SwimTerms", "severityForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final SwimTerms.SeverityForm INSTANCE = new SwimTerms.SeverityForm();

  }

}
