// Copyright 2015-2021 Swim inc.
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

import {OutputSettings, Output, OutputStyle, Format, Display} from "@swim/codec";

/**
 * Evidence for or against the validity of a test assertion.
 */
export abstract class Proof implements Display {
  /**
   * Returns `true` if this `Proof` supports the validity of the assertion.
   */
  abstract isValid(): boolean;

  /**
   * Returns `true` if this `Proof` is pending implementation.
   */
  isPending(): boolean {
    return false;
  }

  /**
   * An optional message detailing the circumstances of the assertion.
   */
  abstract readonly message: string | undefined;

  abstract display(output: Output): void;

  toString(settings?: OutputSettings): string {
    return Format.display(this, settings);
  }

  /**
   * Returns generic `Proof` for the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static valid(operator: string, message?: string): ValidProof {
    return new ValidProof(operator, message);
  }

  /**
   * Returns generic `Proof` against the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static invalid(operator: string, message?: string): InvalidProof {
    return new InvalidProof(operator, message);
  }

  /**
   * Returns specific `Proof` against the validity of a binary `operator`
   * assertion, citing contradictory left- and right-hand side operands, along
   * with an optional `message` detailing the circumstances of the assertion.
   */
  static refuted(lhs: unknown, operator: string, rhs: unknown, message?: string): RefutedProof {
    return new RefutedProof(lhs, operator, rhs, message);
  }

  /**
   * Returns `Proof` against the validity of an assertion due to an `error`
   * that was thrown while evaluating the assertion, along with an optional
   * `message` detailing the circumstances of the assertion.
   */
  static error(error: unknown, message?: string): ErrorProof {
    return new ErrorProof(error, message);
  }

  /**
   * Returns tentative `Proof` for the validity of an assertion that hasn't
   * yet been implemented, along with an optional `message` detailing the
   * circumstances of the assertion.
   */
  static pending(message?: string): PendingProof {
    return new PendingProof(message);
  }
}

/**
 * Generic `Proof` for the validity of an assertion.
 */
export class ValidProof extends Proof {
  constructor(operator: string, message: string | undefined) {
    super();
    Object.defineProperty(this, "operator", {
      value: operator,
      enumerable: true,
    });
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
    });
  }

  override isValid(): boolean {
    return true;
  }

  /**
   * The name of the asserted operator.
   */
  readonly operator!: string;

  override readonly message!: string | undefined;

  override display(output: Output): void {
    if (this.message !== void 0) {
      OutputStyle.gray(output);
      output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.green(output);
    output = output.write(this.operator);
    OutputStyle.reset(output);
  }
}

/**
 * Generic `Proof` against the validity of an assertion.
 */
export class InvalidProof extends Proof {
  constructor(operator: string, message: string | undefined) {
    super();
    Object.defineProperty(this, "operator", {
      value: operator,
      enumerable: true,
    });
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
    });
  }

  override isValid(): boolean {
    return false;
  }

  /**
   * The name of the asserted operator.
   */
  readonly operator!: string;

  override readonly message!: string | undefined;

  override display(output: Output): void {
    if (this.message !== void 0) {
      OutputStyle.gray(output);
      output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.red(output);
    output = output.write(this.operator);
    OutputStyle.reset(output);
  }
}

/**
 * Specific `Proof` against the validity of a binary operator assertion.
 */
export class RefutedProof extends Proof {
  constructor(lhs: unknown, operator: string, rhs: unknown, message: string | undefined) {
    super();
    Object.defineProperty(this, "lhs", {
      value: lhs,
      enumerable: true,
    });
    Object.defineProperty(this, "operator", {
      value: operator,
      enumerable: true,
    });
    Object.defineProperty(this, "rhs", {
      value: rhs,
      enumerable: true,
    });
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
    });
  }

  isValid(): boolean {
    return false;
  }

  /**
   * Returns the left-hand side of the contradictory expression.
   */
  readonly lhs!: unknown;

  /**
   * The name of the asserted binary operator.
   */
  readonly operator!: string;

  /**
   * Returns the right-hand side of the contradictory expression.
   */
  readonly rhs!: unknown;

  override readonly message!: string | undefined;

  override display(output: Output): void {
    if (this.message !== void 0) {
      OutputStyle.gray(output);
      output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    output.display(this.lhs);

    output = output.write(32/*' '*/);
    OutputStyle.red(output);
    output = output.write(this.operator);
    OutputStyle.reset(output);
    output = output.write(32/*' '*/);

    output.display(this.rhs);
  }
}

/**
 * `Proof` against the validity of an assertion due to an exception.
 */
export class ErrorProof extends Proof {
  constructor(error: unknown, message: string | undefined) {
    super();
    Object.defineProperty(this, "error", {
      value: error,
      enumerable: true,
    });
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
    });
  }

  override isValid(): boolean {
    return false;
  }

  /**
   * The exception that was thrown while evaluating the assertion.
   */
  readonly error!: unknown;

  override readonly message!: string | undefined;

  override display(output: Output): void {
    if (this.message !== void 0) {
      OutputStyle.gray(output);
      output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.red(output);
    output = output.write("" + this.error);
    OutputStyle.reset(output);

    const stack = (this.error as Error).stack;
    if (typeof stack === "string") {
      output = output.writeln().write(stack);
    }
  }
}

/**
 * Tentative `Proof` for the validity of an assertion that hasn't yet been
 * implemented.
 */
export class PendingProof extends Proof {
  constructor(message: string | undefined) {
    super();
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
    });
  }

  override isValid(): boolean {
    return true;
  }

  override isPending(): boolean {
    return true;
  }

  override readonly message!: string | undefined;

  override display(output: Output): void {
    if (this.message !== void 0) {
      OutputStyle.gray(output);
      output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.yellow(output);
    output = output.write("pending");
    OutputStyle.reset(output);
  }
}
