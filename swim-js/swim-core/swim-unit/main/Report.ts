// Copyright 2015-2024 Nstream, inc.
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

import type {Proof} from "./Proof";
import type {Exam} from "./Exam";
import type {Suite} from "./Suite";

/**
 * Unit test result aggregator.
 * @public
 */
export interface Report {
  /**
   * Lifecycle callback invoked before running the `suite`.
   */
  willRunSuite?(suite: Suite): void;

  /**
   * Lifecycle callback invoked before running any [[TestMethod test method]]
   * registered with the `suite`.
   */
  willRunTests?(suite: Suite): void;

  /**
   * Lifecycle callback invoked before evaluating the `exam`'s
   * [[TestMethod test methods]].
   */
  willRunTest?(suite: Suite, exam: Exam): void;

  /**
   * Lifecycle callback invoked every time a test function attempts to prove
   * an assertion.
   */
  onProof?(suite: Suite, exam: Exam, proof: Proof): void;

  /**
   * Lifecycle callback invoked every time a test function makes a comment.
   */
  onComment?(suite: Suite, exam: Exam, message: string): void;

  /**
   * Lifecycle callback invoked after evaluating the `exam`'s
   * [[TestMethod test methods]], passing in the returned value
   * of the test function a thrown exception–in `result`.
   */
  didRunTest?(suite: Suite, exam: Exam, result: unknown): void;

  /**
   * Lifecycle callback invoked after all [[TestMethod test method]]
   * registered with the `suite` have been evaluated.
   */
  didRunTests?(suite: Suite): void;

  /**
   * Lifecycle callback invoked before executing any child units returned
   * by [[TestUnit unit factory functions]] registered with the `suite`.
   */
  willRunUnits?(suite: Suite): void;

  /**
   * Lifecycle callback invoked before executing a child `unit` suite.
   */
  willRunUnit?(suite: Suite, unit: Suite): void;

  /**
   * Lifecycle callback invoked after executing a child `unit` suite.
   */
  didRunUnit?(suite: Suite, unit: Suite): void;

  /**
   * Lifecycle callback invoked after all child units returned by
   * [[TestUnit unit factory functions]] registered with the `suite`
   * have been executed.
   */
  didRunUnits?(suite: Suite): void;

  /**
   * Lifecycle callback invoked after all [[TestMethod test methods]]
   * and child units returned by [[UnitMethod unit factory]] methods
   * registered with the `suite` have been evaluated.
   */
  didRunSpec?(suite: Suite): void;
}
