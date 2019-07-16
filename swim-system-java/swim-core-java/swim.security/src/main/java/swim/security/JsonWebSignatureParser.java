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

package swim.security;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Data;

final class JsonWebSignatureParser extends Parser<JsonWebSignature> {
  final Data signingInput;
  final Data protectedHeaderData;
  final Data payloadData;
  final Data signatureData;
  final int p;
  final int q;
  final int r;
  final int step;

  JsonWebSignatureParser(Data signingInput, Data protectedHeaderData, Data payloadData,
                         Data signatureData, int p, int q, int r, int step) {
    this.signingInput = signingInput;
    this.protectedHeaderData = protectedHeaderData;
    this.payloadData = payloadData;
    this.signatureData = signatureData;
    this.p = p;
    this.q = q;
    this.r = r;
    this.step = step;
  }

  JsonWebSignatureParser() {
    this(null, null, null, null, 0, 0, 0, 1);
  }

  @Override
  public Parser<JsonWebSignature> feed(Input input) {
    return parse(signingInput, protectedHeaderData, payloadData,
                 signatureData, p, q, r, step, input);
  }

  static Parser<JsonWebSignature> parse(Data signingInput, Data protectedHeaderData,
                                        Data payloadData, Data signatureData,
                                        int p, int q, int r, int step, Input input) {
    int c;
    if (signingInput == null) {
      signingInput = Data.create();
    }
    if (protectedHeaderData == null) {
      protectedHeaderData = Data.create();
    }
    if (payloadData == null) {
      payloadData = Data.create();
    }
    if (signatureData == null) {
      signatureData = Data.create();
    }
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            p = c;
            step = 2;
          } else {
            step = 5;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            q = c;
            step = 3;
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            r = c;
            step = 4;
          } else {
            decodeBase64Quantum(p, q, '=', '=', protectedHeaderData);
            step = 5;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            decodeBase64Quantum(p, q, r, c, protectedHeaderData);
            step = 1;
            continue;
          } else {
            decodeBase64Quantum(p, q, r, '=', protectedHeaderData);
            step = 5;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == '.') {
          input = input.step();
          signingInput.addByte((byte) c);
          step = 6;
        } else {
          return error(Diagnostic.expected('.', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    do {
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            p = c;
            step = 7;
          } else {
            step = 10;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            q = c;
            step = 8;
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            r = c;
            step = 9;
          } else {
            decodeBase64Quantum(p, q, '=', '=', payloadData);
            step = 10;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            signingInput.addByte((byte) c);
            decodeBase64Quantum(p, q, r, c, payloadData);
            step = 6;
            continue;
          } else {
            decodeBase64Quantum(p, q, r, '=', payloadData);
            step = 10;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    if (step == 10) {
      if (input.isCont()) {
        c = input.head();
        if (c == '.') {
          input = input.step();
          step = 11;
        } else {
          return error(Diagnostic.expected('.', input));
        }
      } else {
        return error(Diagnostic.unexpected(input));
      }
    }
    do {
      if (step == 11) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            p = c;
            step = 12;
          } else {
            return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
          }
        } else if (input.isDone()) {
          return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
        }
      }
      if (step == 12) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            q = c;
            step = 13;
          } else {
            return error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 13) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            r = c;
            step = 14;
          } else {
            decodeBase64Quantum(p, q, '=', '=', signatureData);
            return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
          }
        } else if (input.isDone()) {
          decodeBase64Quantum(p, q, '=', '=', signatureData);
          return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
        }
      }
      if (step == 14) {
        if (input.isCont()) {
          c = input.head();
          if (isBase64Char(c)) {
            input = input.step();
            decodeBase64Quantum(p, q, r, c, signatureData);
            step = 11;
            continue;
          } else {
            decodeBase64Quantum(p, q, r, '=', signatureData);
            return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
          }
        } else if (input.isDone()) {
          decodeBase64Quantum(p, q, r, '=', signatureData);
          return done(JsonWebSignature.from(signingInput, protectedHeaderData, payloadData, signatureData));
        }
      }
      break;
    } while (true);
    return new JsonWebSignatureParser(signingInput, protectedHeaderData, payloadData,
                                      signatureData, p, q, r, step);
  }

  static Parser<JsonWebSignature> parse(Input input) {
    return parse(null, null, null, null, 0, 0, 0, 1, input);
  }

  static boolean isBase64Char(int c) {
    return c >= '0' && c <= '9'
        || c >= 'A' && c <= 'Z'
        || c >= 'a' && c <= 'z'
        || c == '-' || c == '_';
  }

  static int decodeBase64Digit(int c) {
    if (c >= 'A' && c <= 'Z') {
      return c - 'A';
    } else if (c >= 'a' && c <= 'z') {
      return c + (26 - 'a');
    } else if (c >= '0' && c <= '9') {
      return c + (52 - '0');
    } else if (c == '-') {
      return 62;
    } else if (c == '_') {
      return 63;
    } else {
      final String message = new StringBuilder("invalid base64 digit: ").appendCodePoint(c).toString();
      throw new IllegalArgumentException(message);
    }
  }

  static void decodeBase64Quantum(int p, int q, int r, int s, Data data) {
    final int x = decodeBase64Digit(p);
    final int y = decodeBase64Digit(q);
    if (r != '=') {
      final int z = decodeBase64Digit(r);
      if (s != '=') {
        final int w = decodeBase64Digit(s);
        data.addByte((byte) ((x << 2) | (y >>> 4)));
        data.addByte((byte) ((y << 4) | (z >>> 2)));
        data.addByte((byte) ((z << 6) | w));
      } else {
        data.addByte((byte) ((x << 2) | (y >>> 4)));
        data.addByte((byte) ((y << 4) | (z >>> 2)));
      }
    } else {
      if (s != '=') {
        throw new IllegalArgumentException("expected '='");
      }
      data.addByte((byte) ((x << 2) | (y >>> 4)));
    }
  }
}
