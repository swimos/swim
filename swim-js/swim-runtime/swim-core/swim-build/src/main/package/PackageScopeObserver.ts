// Copyright 2015-2023 Swim.inc
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

import type {ScopeObserver} from "../scope/ScopeObserver";
import type {PackageScope} from "./PackageScope";
import type {LibraryScope} from "../library/LibraryScope";

/** @public */
export interface PackageScopeObserver<T extends PackageScope = PackageScope> extends ScopeObserver<T> {
  packageLibraryDidChange?(libraryScope: LibraryScope, packageScope: PackageScope): void;

  packageDependencyDidChange?(dependencyScope: PackageScope, packageScope: PackageScope): void;

  packageDidChange?(packageScope: PackageScope): void;
}
