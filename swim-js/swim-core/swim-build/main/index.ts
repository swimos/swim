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

export type {WorkspaceObserver} from "./Workspace";
export {Workspace} from "./Workspace";

export type {ScopeObserver} from "./Scope";
export {Scope} from "./Scope";

export {TaskStatus} from "./Task";
export type {TaskOptions} from "./Task";
export type {TaskOptionsType} from "./Task";
export type {TaskConfig} from "./Task";
export type {TaskObserver} from "./Task";
export {Task} from "./Task";

// Package scope

export type {PackageTaskOptions} from "./PackageTask";
export {PackageTask} from "./PackageTask";

export {DepsTask} from "./DepsTask";

export {LibsTask} from "./LibsTask";

export {TestTask} from "./TestTask";

export {DocTask} from "./DocTask";

export type {VersionTaskOptions} from "./VersionTask";
export {VersionTask} from "./VersionTask";

export type {PublishTaskOptions} from "./PublishTask";
export {PublishTask} from "./PublishTask";

export {CleanTask} from "./CleanTask";

export type {PackageConfig} from "./PackageScope";
export type {PackageScopeObserver} from "./PackageScope";
export {PackageScope} from "./PackageScope";

// Library scope

export type {LibraryTaskOptions} from "./LibraryTask";
export {LibraryTask} from "./LibraryTask";

export {CompileTask} from "./CompileTask";

export {LintTask} from "./LintTask";

export {ApiTask} from "./ApiTask";

export {BundleTask} from "./BundleTask";

export type {BuildTaskOptions} from "./BuildTask";
export {BuildTask} from "./BuildTask";

export type {WatchTaskObserver} from "./WatchTask";
export {WatchTask} from "./WatchTask";

export type {LibraryScopeObserver} from "./LibraryScope";
export {LibraryScope} from "./LibraryScope";

// Watcher scope

export type {WatcherScopeObserver} from "./WatcherScope";
export {WatcherScope} from "./WatcherScope";
