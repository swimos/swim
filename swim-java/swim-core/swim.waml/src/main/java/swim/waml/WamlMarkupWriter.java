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

package swim.waml;

import java.util.Iterator;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;

@Public
@Since("5.0")
public interface WamlMarkupWriter<N, @Contravariant T> extends WamlWriter<T> {

  WamlWriter<N> nodeWriter();

  @Nullable String asText(@Nullable N node) throws WamlException;

  @Nullable Iterator<? extends N> intoNodes(@Nullable T value) throws WamlException;

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T value, WamlWriterOptions options) {
    final Iterator<? extends N> nodes;
    try {
      nodes = this.intoNodes(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (nodes == null) {
      return this.writeUnit(output, attrs, options);
    }
    return this.writeMarkup(output, attrs, nodes, options);
  }

  @Override
  default Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    final Iterator<? extends N> nodes;
    try {
      nodes = this.intoNodes(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (nodes == null) {
      return Write.error(new NullPointerException("inline markup nodes"));
    }
    final Object attrs;
    try {
      attrs = this.getAttrs(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    return this.writeInlineMarkup(output, attrs, nodes, options);
  }

  default Write<?> writeMarkup(Output<?> output, @Nullable Object attrs,
                               Iterator<? extends N> nodes, WamlWriterOptions options) {
    return WriteWamlMarkup.write(output, this, options, attrs, nodes, null, null, null, false, 0, 0, 1);
  }

  default Write<?> writeInlineMarkup(Output<?> output, @Nullable Object attrs,
                                     Iterator<? extends N> nodes, WamlWriterOptions options) {
    return WriteWamlMarkup.write(output, this, options, attrs, nodes, null, null, null, true, 0, 0, 1);
  }

}

final class WriteWamlMarkup<N> extends Write<Object> {

  final WamlMarkupWriter<N, ?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final Iterator<? extends N> nodes;
  final @Nullable String text;
  final @Nullable N node;
  final @Nullable Write<?> write;
  final boolean inline;
  final int index;
  final int escape;
  final int step;

  WriteWamlMarkup(WamlMarkupWriter<N, ?> writer, WamlWriterOptions options, @Nullable Object attrs,
                  Iterator<? extends N> nodes, @Nullable String text, @Nullable N node,
                  @Nullable Write<?> write, boolean inline, int index, int escape, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.nodes = nodes;
    this.text = text;
    this.node = node;
    this.write = write;
    this.inline = inline;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlMarkup.write(output, this.writer, this.options, this.attrs,
                                 this.nodes, this.text, this.node, this.write,
                                 this.inline, this.index, this.escape, this.step);
  }

  static <N> Write<Object> write(Output<?> output, WamlMarkupWriter<N, ?> writer,
                                 WamlWriterOptions options, @Nullable Object attrs,
                                 Iterator<? extends N> nodes, @Nullable String text,
                                 @Nullable N node, @Nullable Write<?> write,
                                 boolean inline, int index, int escape, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options,
                                                !inline && options.whitespace());
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('<');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output.write('<');
      step = 4;
    }
    do {
      if (step == 4) {
        if (!nodes.hasNext()) {
          step = 18;
          break;
        }
        node = nodes.next();
        try {
          text = writer.asText(node);
          if (text != null) {
            node = null;
            step = 5;
          } else if (writer.nodeWriter().isInline(node)) {
            step = 12;
          } else {
            step = 13;
          }
        } catch (WamlException cause) {
          return Write.error(cause);
        }
      }
      if (step == 5 && output.isCont()) {
        text = Assume.nonNull(text);
        if (index >= text.length()) {
          text = null;
          index = 0;
          step = 4;
          continue;
        }
        final int c = text.codePointAt(index);
        index = text.offsetByCodePoints(index, 1);
        if (c == '<' || c == '>' || c == '@' || c == '\\' || c == '{' || c == '}') {
          output.write('\\');
          escape = c;
          step = 6;
        } else if (c == '\b') {
          output.write('\\');
          escape = 'b';
          step = 6;
        } else if (c == '\f') {
          output.write('\\');
          escape = 'f';
          step = 6;
        } else if (c == '\n') {
          output.write('\\');
          escape = 'n';
          step = 6;
        } else if (c == '\r') {
          output.write('\\');
          escape = 'r';
          step = 6;
        } else if (c == '\t') {
          output.write('\\');
          escape = 't';
          step = 6;
        } else if (c < 0x20) {
          output.write('\\');
          escape = c;
          step = 7;
        } else {
          output.write(c);
          continue;
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 5;
        continue;
      }
      if (step == 7 && output.isCont()) {
        output.write('u');
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 9;
      }
      if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 10;
      }
      if (step == 10 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 11;
      }
      if (step == 11 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 5;
      }
      if (step == 12) {
        if (write == null) {
          write = writer.nodeWriter().writeInline(output, node, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          node = null;
          step = 4;
          continue;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 13 && output.isCont()) {
        output.write('{');
        step = 14;
      }
      if (step == 14) {
        if (write == null) {
          write = writer.nodeWriter().write(output, node, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (!nodes.hasNext()) {
            node = null;
            step = 17;
          } else {
            node = nodes.next();
            try {
              text = writer.asText(node);
              if (text != null) {
                node = null;
                step = 17;
              } else if (writer.nodeWriter().isInline(node)) {
                step = 17;
              } else {
                step = 15;
              }
            } catch (WamlException cause) {
              return Write.error(cause);
            }
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 15 && output.isCont()) {
        output.write(',');
        step = 16;
      }
      if (step == 16) {
        if (!options.whitespace()) {
          step = 14;
          continue;
        } else if (output.isCont()) {
          output.write(' ');
          step = 14;
          continue;
        }
      }
      if (step == 17 && output.isCont()) {
        output.write('}');
        if (node != null) {
          step = 12;
        } else if (text != null) {
          step = 5;
        } else {
          step = 4;
        }
        continue;
      }
      break;
    } while (true);
    if (step == 18 && output.isCont()) {
      output.write('>');
      step = 19;
    }
    if (step == 19 && output.isCont()) {
      output.write('>');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlMarkup<N>(writer, options, attrs, nodes, text, node,
                                  write, inline, index, escape, step);
  }

}
