/*
 * Copyright 2020 Lunatech S.A.S
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useContext, useEffect, useState} from 'react';
import {Button, Col, Divider, message, Modal, Row, Typography} from 'antd';
import './ShowProject.less';
import PropTypes from 'prop-types';
import {DesktopOutlined, DollarOutlined, LockOutlined, SnippetsFilled, UserOutlined} from '@ant-design/icons';
import TitleSection from '../Title/TitleSection';
import CardLg from '../Card/CardLg';
import CardXs from '../Card/CardXs';
import TagMember from '../Tag/TagMember';
import TagProjectClient from '../Tag/TagProjectClient';
import ShowTimeSheet from '../TimeSheet/ShowTimeSheet';
import Tooltip from 'antd/lib/tooltip';
import NoDataMessage from '../NoDataMessage/NoDataMessage';
import {useTimeKeeperAPIPut} from '../../utils/services';
import {UserContext} from '../../context/UserContext';
import TkUserAvatar from '../Users/TkUserAvatar';

const {Title} = Typography;

const ShowProject = ({project, onSuccessJoinProject}) => {

  const [projectUpdated, setProjectUpdated] = useState(false);

  const timeKeeperAPIPutJoin = useTimeKeeperAPIPut(`/api/projects/${project.id}/join`, (form => form), setProjectUpdated);

  const {currentUser} = useContext(UserContext);

  useEffect(() => {
    if (projectUpdated) {
      message.success('You successfully joined the project');
      onSuccessJoinProject && onSuccessJoinProject();
    }
    return () => setProjectUpdated(false);
  }, [projectUpdated, onSuccessJoinProject]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState();
  const Members = () => {
    if (!project.users || project.users.length === 0) {
      return (
        <NoDataMessage message='There is no member on the project…'/>
      );
    } else {
      const users = project.users.sort((u1, u2) => {
        const res = u2.manager - u1.manager;
        return res === 0 ? u1.name.localeCompare(u2.name) : res;
      });
      return users.map(user =>
        <CardXs key={`project-member-${user.id}`}>
          <div>
            <TkUserAvatar picture={user.picture} name={user.name}/>
            <p>{user.name}</p>
          </div>
          <div>
            <TagMember isManager={user.manager}/>
            <Divider type='vertical'/>
            <Tooltip title='Time sheet'>
              <SnippetsFilled onClick={() => {
                setModalVisible(true);
                setSelectedMember(user);
              }}/>
            </Tooltip>
          </div>
        </CardXs>
      );
    }
  };

  const ModalTimeSheet = () => {
    return (
      <Modal
        visible={modalVisible}
        closable={true}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={'37.5%'}
      >
        <ShowTimeSheet project={project} member={selectedMember} />
      </Modal>
    );
  };

  const isMember = !!project.users.find(item => currentUser.id === item.id);
  const showJoinButton = project.publicAccess && !isMember;

  return (
    <div>
      <ModalTimeSheet/>
      <CardLg>
        <div className="tk_CardLg_Top">
          <Title level={2}>{project.name}</Title>
          {showJoinButton && <Button id="btnJoinProject" type="button" onClick={() => timeKeeperAPIPutJoin.run()}>Join this project</Button>}
        </div>
        <Row gutter={32}>
          <Col span={12}>
            <div>
              <TitleSection title="Information"/>
            </div>
            <Row gutter={32}>
              <Col span={12}>
                <p className="tk_ProjectAtt"><DesktopOutlined/> Client: <TagProjectClient client={project.client}/></p>
                <p className="tk_ProjectAtt"><UserOutlined/> Members: {project.users ? project.users.length : 0}</p>
              </Col>
              <Col span={12}>
                <p className="tk_ProjectAtt"><DollarOutlined/> Billable: {project.billable ? 'Yes' : 'No'}</p>
                <p className="tk_ProjectAtt"><LockOutlined/> Project type
                  : {project.publicAccess ? 'Public' : 'Private'}</p>
              </Col>
            </Row>
            <p className="tk_ProjectDesc">{project.description}</p>
          </Col>
          <Col span={12}>
            <TitleSection title="Members"/>
            <Members/>
          </Col>
        </Row>
      </CardLg>
    </div>
  );
};

ShowProject.propTypes = {
  project: PropTypes.object.isRequired,
  onSuccessJoinProject: PropTypes.func
};

export default ShowProject;