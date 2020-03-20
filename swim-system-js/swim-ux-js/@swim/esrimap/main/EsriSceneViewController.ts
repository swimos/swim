// Copyright 2015-2020 SWIM.AI inc.
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

import {EsriViewController} from "./EsriViewController";
import {EsriSceneViewProjection} from "./EsriSceneViewProjection";
import {EsriSceneView} from "./EsriSceneView";
import {EsriSceneViewObserver} from "./EsriSceneViewObserver";

export class EsriSceneViewController<V extends EsriSceneView = EsriSceneView> extends EsriViewController<V> implements EsriSceneViewObserver<V> {
  viewWillSetProjection(projection: EsriSceneViewProjection, view: V): void {
    // hook
  }

  viewDidSetProjection(projection: EsriSceneViewProjection, view: V): void {
    // hook
  }
}
