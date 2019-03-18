/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';

import { ActionEventEditorApp } from '../../../embeddable_action_editor/public/app';
import { DashboardContainer, 
  DashboardEmbeddable } from '../../../../../src/legacy/core_plugins/dashboard_embeddable/public';
import React, { Component } from 'react';

interface CustomizeEventsFlyoutProps {
  container: DashboardContainer;
  embeddable: DashboardEmbeddable;
  onClose: () => void;
}

export class CustomizeEventsFlyout extends Component<CustomizeEventsFlyoutProps> {
  constructor(props: CustomizeEventsFlyoutProps) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <React.Fragment>
        <EuiFlyoutHeader>
          <EuiTitle size="s" data-test-subj="customizePanelTitle">
            <h1>{this.props.embeddable.getOutput().title}</h1>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <ActionEventEditorApp embeddable={this.props.embeddable} />
        </EuiFlyoutBody>
      </React.Fragment>
    );
  }
}