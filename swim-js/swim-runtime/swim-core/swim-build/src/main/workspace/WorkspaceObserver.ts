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

import type {ServiceObserver} from "@swim/component";
import type {Workspace} from "./Workspace";
import type {PackageScope} from "../package/PackageScope";
import type {LibraryScope} from "../library/LibraryScope";

/** @public */
export interface WorkspaceObserver<S extends Workspace = Workspace> extends ServiceObserver<S> {
  serviceWillAttachPackage?(packageScope: PackageScope, service: S): void;

  serviceDidAttachPackage?(packageScope: PackageScope, service: S): void;

  serviceWillDetachPackage?(packageScope: PackageScope, service: S): void;

  serviceDidDetachPackage?(packageScope: PackageScope, service: S): void;

  serviceWillAttachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceDidAttachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceWillDetachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceDidDetachLibrary?(libraryScope: LibraryScope, service: S): void;

  servicePackageDidChange?(packageScope: PackageScope, service: S): void;

  serviceLibraryDidChange?(libraryScope: LibraryScope, service: S): void;
}
