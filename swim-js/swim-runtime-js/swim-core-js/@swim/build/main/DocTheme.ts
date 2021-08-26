// Copyright 2015-2021 Swim Inc.
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

import * as typedoc from "typedoc";
import type {Target} from "./Target";

export class DocTheme extends typedoc.DefaultTheme {
  rootTargets: Target[];
  targetReflections: {[uid: string]: typedoc.ContainerReflection | undefined};

  constructor(renderer: typedoc.Renderer, basePath: string, rootTargets: Target[],
              targetReflections: {[uid: string]: typedoc.ContainerReflection | undefined}) {
    super(renderer, basePath);
    this.rootTargets = rootTargets;
    this.targetReflections = targetReflections;
  }

  override getUrls(project: typedoc.ProjectReflection): typedoc.UrlMapping[] {
    const urls: typedoc.UrlMapping[] = [];

    const rootTarget = this.rootTargets.length === 1 ? this.rootTargets[0]! : null;
    const rootReflection = rootTarget !== null ? this.targetReflections[rootTarget.uid]! : null;
    if (rootTarget === null) {
      urls.push(new typedoc.UrlMapping("index.html", project, "reflection.hbs"));
    } else {
      urls.push(new typedoc.UrlMapping("index.html", rootReflection, "reflection.hbs"));
      if (rootTarget.project.framework) {
        urls.push(new typedoc.UrlMapping("modules.html", project, "reflection.hbs"));
      }
    }

    project.url = "index.html";
    project.children?.forEach(function (child: typedoc.Reflection): void {
      if (child instanceof typedoc.DeclarationReflection) {
        DocTheme.buildUrls(child, urls);
      }
    });

    if (rootReflection !== null) {
      rootReflection.url = "index.html";
    }

    return urls;
  }

  override getNavigation(project: typedoc.ProjectReflection): typedoc.NavigationItem {
    const rootItem = new typedoc.NavigationItem("Index", "index.html");
    const rootTarget = this.rootTargets.length === 1 ? this.rootTargets[0]! : null;
    if (rootTarget === null) {
      const modulesItem = new typedoc.NavigationItem("Modules", "index.html", rootItem);
      modulesItem.isModules = true;
    } else if (rootTarget.project.framework) {
      const modulesItem = new typedoc.NavigationItem("Modules", "modules.html", rootItem);
      modulesItem.isModules = true;
    }
    for (let i = 0; i < this.rootTargets.length; i += 1) {
      this.buildTargetNavigation(rootItem, this.rootTargets[i]!);
    }
    return rootItem;
  }

  protected buildTargetNavigation(parentItem: typedoc.NavigationItem, target: Target): void {
    const targetReflection = this.targetReflections[target.uid];
    if (targetReflection !== void 0) {
      const targetItem = typedoc.NavigationItem.create(targetReflection, parentItem);
      if (target.project.framework) {
        targetReflection.kindString = "Framework";
        const targetDeps = target.deps;
        for (let i = 0; i < targetDeps.length; i += 1) {
          this.buildTargetNavigation(targetItem, targetDeps[i]!);
        }
      } else {
        targetReflection.kindString = "Library";
      }
      this.includeDedicatedUrls(targetReflection, targetItem);
    }
  }

  protected includeDedicatedUrls(reflection: typedoc.ContainerReflection, item: typedoc.NavigationItem) {
    const childCount = reflection.children !== void 0 ? reflection.children.length : 0;
    for (let i = 0; i < childCount; i += 1) {
      const childReflection = reflection.children![i]!;
      if (childReflection.hasOwnDocument && !childReflection.kindOf(typedoc.ReflectionKind.Module)) {
        if (item.dedicatedUrls === void 0) {
          item.dedicatedUrls = [];
        }
        item.dedicatedUrls.push(childReflection.url!);
        this.includeDedicatedUrls(childReflection, item);
      }
    }
  }
}
