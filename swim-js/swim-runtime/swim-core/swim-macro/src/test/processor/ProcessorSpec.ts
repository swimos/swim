// Copyright 2015-2021 Swim.inc
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

import {Spec, Test, Exam} from "@swim/unit";
import {
  Processor,
  DefineDirective,
  IncludeDirective,
  TemplateDirective,
  ConvertDirective,
  ExportDirective,
  IfDirective,
  EachDirective,
  HighlightDirective,
  ReconConverter,
  HtmlConverter,
  CssConverter,
} from "@swim/macro";

export class ProcessorSpec extends Spec {
  @Test
  hasBuiltinDirectives(exam: Exam): void {
    const processor = new Processor();
    exam.instanceOf(processor.getDirective("define"), DefineDirective);
    exam.instanceOf(processor.getDirective("include"), IncludeDirective);
    exam.instanceOf(processor.getDirective("template"), TemplateDirective);
    exam.instanceOf(processor.getDirective("convert"), ConvertDirective);
    exam.instanceOf(processor.getDirective("export"), ExportDirective);
    exam.instanceOf(processor.getDirective("if"), IfDirective);
    exam.instanceOf(processor.getDirective("each"), EachDirective);
    exam.instanceOf(processor.getDirective("highlight"), HighlightDirective);
  }

  @Test
  hasBuiltinConverters(exam: Exam): void {
    const processor = new Processor();
    exam.instanceOf(processor.getConverter("recon"), ReconConverter);
    exam.instanceOf(processor.getConverter("html"), HtmlConverter);
    exam.instanceOf(processor.getConverter("css"), CssConverter);
  }
}
