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

import type {ServiceObserver} from "@swim/component";
import type {Workspace} from "./Workspace";
import type {Scope} from "../scope/Scope";
import type {PackageScope} from "../package/PackageScope";
import type {LibraryScope} from "../library/LibraryScope";

/** @public */
export interface WorkspaceObserver<T extends Scope = Scope, S extends Workspace<T> = Workspace<T>> extends ServiceObserver<T, S> {
  workspaceWillAttachPackage?(packageScope: PackageScope, workspace: S): void;

  workspaceDidAttachPackage?(packageScope: PackageScope, workspace: S): void;

  workspaceWillDetachPackage?(packageScope: PackageScope, workspace: S): void;

  workspaceDidDetachPackage?(packageScope: PackageScope, workspace: S): void;

  workspaceWillAttachLibrary?(libraryScope: LibraryScope, workspace: S): void;

  workspaceDidAttachLibrary?(libraryScope: LibraryScope, workspace: S): void;

  workspaceWillDetachLibrary?(libraryScope: LibraryScope, workspace: S): void;

  workspaceDidDetachLibrary?(libraryScope: LibraryScope, workspace: S): void;

  workspacePackageDidChange?(packageScope: PackageScope, workspace: S): void;

  workspaceLibraryDidChange?(libraryScope: LibraryScope, workspace: S): void;
}
