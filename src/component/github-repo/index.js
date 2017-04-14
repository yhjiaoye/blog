/**
 * Created by axetroy on 17-4-6.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Spin } from 'antd';
import sortBy from 'lodash.sortby';
import Octicon from 'react-octicon';
import moment from 'moment';

import * as $$AllRepos from '../../redux/all-repos';

import github from '../../lib/github';
import pkg from '../../../package.json';

class GithubRepositories extends Component {
  state = {
    allRepos: []
  };

  setStateAsync(newState) {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  }

  async componentWillMount() {
    const allRepos = await this.getAllRepos(1);
    this.props.setAllRepos(allRepos);
  }

  async getAllRepos(page) {
    let repos = [];
    try {
      const {
        data,
        headers
      } = await github.get(`/users/${pkg.config.owner}/repos`, {
        params: { page }
      });
      repos = data;
      const { link } = headers;
      if (link && /rel=['"]next['"]/.test(link)) {
        return repos.concat(await this.getAllRepos(page + 1));
      }
    } catch (err) {
      console.error(err);
    }
    return repos;
  }

  render() {
    return (
      <Spin spinning={false}>
        <Row
          className="text-center"
          style={{
            borderBottom: '0.1rem solid #e6e6e6',
            padding: '2rem 0',
            fontSize: '1.5rem'
          }}
        >
          <Col span={8} style={{ borderRight: '0.1rem solid #e6e6e6' }}>
            <p>
              <Octicon className="font-size-2rem mr5" name="star" mega />
              {this.props.allRepos
                .map(repo => repo.watchers_count)
                .reduce((a, b) => a + b, 0) || 0}
            </p>
            <p>收获Star数</p>
          </Col>
          <Col span={8}>
            <p>
              <Octicon className="font-size-2rem mr5" name="gist-fork" mega />
              {this.props.allRepos
                .map(repo => repo.forks_count)
                .reduce((a, b) => a + b, 0) || 0}
            </p>
            <p>收获Fork数</p>
          </Col>
          <Col
            span={8}
            style={{
              borderLeft: '0.1rem solid #e6e6e6'
            }}
          >
            <p>
              <Octicon className="font-size-2rem mr5" name="repo" mega />
              {this.props.allRepos.filter(repo => !repo.fork).length}
            </p>
            <p>创建的仓库数</p>
          </Col>
        </Row>
        <Row
          className="text-center"
          style={{
            padding: '2rem 0',
            fontSize: '1.5rem'
          }}
        >
          <Col
            span={12}
            style={{
              borderRight: '0.1rem solid #e6e6e6'
            }}
          >
            <p>
              <Octicon className="font-size-2rem mr5" name="package" mega />
              {(() => {
                const sortByStar = sortBy(
                  this.props.allRepos,
                  repo => -repo.watchers_count
                );
                const mostStarRepo = sortByStar[0];
                if (mostStarRepo) {
                  return mostStarRepo.name;
                }
              })()}
            </p>
            <p>最受欢迎的仓库</p>
          </Col>
          <Col span={12}>
            {(() => {
              const sortByTime = sortBy(
                this.props.allRepos,
                repo => -(new Date(repo.updated_at) - new Date(repo.created_at))
              );
              const mostLongTimeRepo = sortByTime[0];
              return mostLongTimeRepo
                ? <p>
                    {moment(mostLongTimeRepo.created_at).format('YYYY-MM-DD')}
                    ~
                    {moment(mostLongTimeRepo.updated_at).format('YYYY-MM-DD')}
                  </p>
                : '';
            })()}
            <p>
              贡献最久的仓库
            </p>
          </Col>
        </Row>
      </Spin>
    );
  }
}
export default connect(
  function mapStateToProps(state) {
    return {
      allRepos: state.allRepos
    };
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        setAllRepos: $$AllRepos.set
      },
      dispatch
    );
  }
)(GithubRepositories);
