/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import { I18nProvider } from '@kbn/i18n/react';
import { IndexPattern } from 'ui/index_patterns';

import {
  Container,
  ContainerInput,
  ContainerOutput,
  Embeddable,
  EmbeddableFactoryRegistry,
  EmbeddableInput,
  Filter,
  Query,
  RefreshConfig,
  ViewMode,
} from 'plugins/embeddable_api/index';
import { TimeRange } from 'ui/timefilter/time_history';

import { DASHBOARD_CONTAINER_TYPE } from './dashboard_container_factory';
import { createPanelState } from './panel';
import { DashboardPanelState } from './types';
import { DashboardViewport } from './viewport/dashboard_viewport';

export interface DashboardContainerInput extends ContainerInput {
  viewMode: ViewMode;
  filters: Filter[];
  query: Query;
  timeRange: TimeRange;
  refreshConfig?: RefreshConfig;
  expandedPanelId?: string;
  useMargins: boolean;
  title: string;
  description?: string;
  isFullScreenMode: boolean;
  panels: { [panelId: string]: DashboardPanelState };

  // Used to force a refresh of embeddables even if there were no other input state
  // changes.
  lastReloadRequestTime?: number;
}

export interface DashboardEmbeddableInput extends EmbeddableInput {
  customization: any;
  filters: Filter[];
  isPanelExpanded: boolean;
  query: Query;
  timeRange: TimeRange;
  refreshConfig?: RefreshConfig;
  viewMode: ViewMode;
  savedObjectId?: string;
  hidePanelTitles?: boolean;
}

export interface DashboardEmbeddableOutput {
  customization: any;
  title: string;
  indexPatterns?: IndexPattern[];
}

export type DashboardEmbeddable = Embeddable<DashboardEmbeddableInput, DashboardEmbeddableOutput>;

export class DashboardContainer extends Container<
  DashboardContainerInput,
  ContainerOutput,
  DashboardEmbeddable
> {
  constructor(
    initialInput: DashboardContainerInput,
    embeddableFactories: EmbeddableFactoryRegistry
  ) {
    super(
      DASHBOARD_CONTAINER_TYPE,
      initialInput,
      { ...initialInput, embeddableLoaded: {} },
      embeddableFactories
    );
  }

  public createNewPanelState(type: string, id?: string): DashboardPanelState {
    const embeddableId = id || uuid.v4();
    return createPanelState({ id: embeddableId }, type, Object.values(this.input.panels));
  }

  public onToggleExpandPanel(id: string) {
    const newValue = this.input.expandedPanelId ? undefined : id;
    this.setInput({
      ...this.input,
      expandedPanelId: newValue,
    });
  }

  public onPanelsUpdated = (panels: { [panelId: string]: DashboardPanelState }) => {
    this.setInput({
      ...this.input,
      panels: {
        ...panels,
      },
    });
  };

  public onExitFullScreenMode = () => {
    this.setInput({
      ...this.input,
      isFullScreenMode: false,
    });
  };

  public render(dom: React.ReactNode) {
    ReactDOM.render(
      // @ts-ignore
      <I18nProvider>
        <DashboardViewport embeddableFactories={this.embeddableFactories} container={this} />
      </I18nProvider>,
      dom
    );
  }

  public getPanelIndexPatterns() {
    const indexPatterns: IndexPattern[] = [];
    Object.values(this.embeddables).forEach(embeddable => {
      const embeddableIndexPatterns = embeddable.getOutput().indexPatterns;
      if (embeddableIndexPatterns) {
        indexPatterns.push(...embeddableIndexPatterns);
      }
    });
    return indexPatterns;
  }

  public getInputForEmbeddable(panelState: DashboardPanelState): DashboardEmbeddableInput {
    const isPanelExpanded = this.input.expandedPanelId === panelState.embeddableId;
    const { viewMode, refreshConfig, timeRange, query, hidePanelTitles, filters } = this.input;
    return {
      filters,
      hidePanelTitles,
      isPanelExpanded,
      query,
      timeRange,
      refreshConfig,
      viewMode,
      ...panelState.initialInput,
      customization: panelState.customization,
      id: panelState.embeddableId,
    };
  }
}