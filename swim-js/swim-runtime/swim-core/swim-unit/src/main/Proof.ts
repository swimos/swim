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

import {OutputSettings, Output, OutputStyle, Format, Display} from "@swim/codec";

/**
 * Evidence for or against the validity of a test assertion.
 * @public
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

  abstract display<T>(output: Output<T>): Output<T>;

  toString(settings?: OutputSettings): string {
    return Format.display(this, settings);
  }

  /**
   * Returns generic `Proof` for the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static valid(operator: string, message?: string): Proof {
    return new ProofValid(operator, message);
  }

  /**
   * Returns generic `Proof` against the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static invalid(operator: string, message?: string): Proof {
    return new ProofInvalid(operator, message);
  }

  /**
   * Returns specific `Proof` against the validity of a binary `operator`
   * assertion, citing contradictory left- and right-hand side operands, along
   * with an optional `message` detailing the circumstances of the assertion.
   */
  static refuted(lhs: unknown, operator: string, rhs: unknown, message?: string): Proof {
    return new ProofRefuted(lhs, operator, rhs, message);
  }

  /**
   * Returns `Proof` against the validity of an assertion due to an `error`
   * that was thrown while evaluating the assertion, along with an optional
   * `message` detailing the circumstances of the assertion.
   */
  static error(error: unknown, message?: string): Proof {
    return new ProofError(error, message);
  }

  /**
   * Returns tentative `Proof` for the validity of an assertion that hasn't
   * yet been implemented, along with an optional `message` detailing the
   * circumstances of the assertion.
   */
  static pending(message?: string): Proof {
    return new ProofPending(message);
  }
}

/**
 * Generic `Proof` for the validity of an assertion.
 * @internal
 */
export class ProofValid extends Proof {
  constructor(operator: string, message: string | undefined) {
    super();
    this.operator = operator;
    this.message = message;
  }

  override isValid(): boolean {
    return true;
  }

  /**
   * The name of the asserted operator.
   */
  readonly operator: string;

  override readonly message: string | undefined;

  override display<T>(output: Output<T>): Output<T> {
    if (this.message !== void 0) {
      output = OutputStyle.gray(output);
      output = output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      output = OutputStyle.reset(output);
    }

    output = OutputStyle.green(output);
    output = output.write(this.operator);
    output = OutputStyle.reset(output);
    return output;
  }
}

/**
 * Generic `Proof` against the validity of an assertion.
 * @internal
 */
export class ProofInvalid extends Proof {
  constructor(operator: string, message: string | undefined) {
    super();
    this.operator = operator;
    this.message = message;
  }

  override isValid(): boolean {
    return false;
  }

  /**
   * The name of the asserted operator.
   */
  readonly operator: string;

  override readonly message: string | undefined;

  override display<T>(output: Output<T>): Output<T> {
    if (this.message !== void 0) {
      output = OutputStyle.gray(output);
      output = output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      output = OutputStyle.reset(output);
    }

    output = OutputStyle.red(output);
    output = output.write(this.operator);
    output = OutputStyle.reset(output);
    return output;
  }
}

/**
 * Specific `Proof` against the validity of a binary operator assertion.
 * @internal
 */
export class ProofRefuted extends Proof {
  constructor(lhs: unknown, operator: string, rhs: unknown, message: string | undefined) {
    super();
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
    this.message = message;
  }

  isValid(): boolean {
    return false;
  }

  /**
   * Returns the left-hand side of the contradictory expression.
   */
  readonly lhs: unknown;

  /**
   * The name of the asserted binary operator.
   */
  readonly operator: string;

  /**
   * Returns the right-hand side of the contradictory expression.
   */
  readonly rhs: unknown;

  override readonly message: string | undefined;

  override display<T>(output: Output<T>): Output<T> {
    if (this.message !== void 0) {
      output = OutputStyle.gray(output);
      output = output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      output = OutputStyle.reset(output);
    }

    output = output.display(this.lhs);

    output = output.write(32/*' '*/);
    output = OutputStyle.red(output);
    output = output.write(this.operator);
    output = OutputStyle.reset(output);
    output = output.write(32/*' '*/);

    output = output.display(this.rhs);
    return output;
  }
}

/**
 * `Proof` against the validity of an assertion due to an exception.
 * @internal
 */
export class ProofError extends Proof {
  constructor(error: unknown, message: string | undefined) {
    super();
    this.error = error;
    this.message = message;
  }

  override isValid(): boolean {
    return false;
  }

  /**
   * The exception that was thrown while evaluating the assertion.
   */
  readonly error: unknown;

  override readonly message: string | undefined;

  override display<T>(output: Output<T>): Output<T> {
    if (this.message !== void 0) {
      output = OutputStyle.gray(output);
      output = output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      output = OutputStyle.reset(output);
    }

    output = OutputStyle.red(output);
    output = output.write("" + this.error);
    output = OutputStyle.reset(output);

    const stack = (this.error as Error).stack;
    if (typeof stack === "string") {
      output = output.writeln().write(stack);
    }
    return output;
  }
}

/**
 * Tentative `Proof` for the validity of an assertion that hasn't yet been
 * implemented.
 * @internal
 */
export class ProofPending extends Proof {
  constructor(message: string | undefined) {
    super();
    this.message = message;
  }

  override isValid(): boolean {
    return true;
  }

  override isPending(): boolean {
    return true;
  }

  override readonly message: string | undefined;

  override display<T>(output: Output<T>): Output<T> {
    if (this.message !== void 0) {
      output = OutputStyle.gray(output);
      output = output.display(this.message).write(58/*':'*/).write(32/*' '*/);
      output = OutputStyle.reset(output);
    }

    output = OutputStyle.yellow(output);
    output = output.write("pending");
    output = OutputStyle.reset(output);
    return output;
  }
}
