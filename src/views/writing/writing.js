import React, { Component } from 'react';
import {getPublished} from '../../../../shared/api/posts.js';
import { Link } from 'react-router-dom';
import {
  Loading,
  ComingSoon
} from '../index.js';
import './writing.css';

export class Writing extends Component {
  state = {
    posts: [],
    isLoading: true
  }

  getDate (stringDate) {
    const date = new Date(stringDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const convertMonth = month > 9 ? month : `0${month}`;
    const convertDay = day > 9 ? day : `0${day}`;

    return `${convertMonth}/${convertDay}/${year}`;
  }

  getListContents() {
    const max = this.state.posts.length - 1;
    return this.state.posts.map((post, i) => (
      <React.Fragment key={post.id}>
        <li className="writing-list-item">
          <Link to={`/writing/${post.id}`}>
            <div className="writing-title">{post.title}</div>
          </Link>
          <div>{this.getDate(post.published_date)}</div>
        </li>
        {
          i < max ?
          <hr/>
          : null
        }
      </React.Fragment>
    ));
  }

  getPostsMap(posts) {
    const map = new Map();

    posts.forEach(post => {
      map.set(post.title, post);
    });

    return map;
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  componentDidMount() {
    getPublished().then(res => {
      const postsMap = this.getPostsMap(res.data);

      this.setState({
        ...this.state,
        posts: res.data,
        postsMap: postsMap,
        isLoading: false
      })
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="writing-container">
        {
          this.state.isLoading ?
          <Loading /> :
          (
            this.state.posts.length ?
            (
              <ul className="writing-list">
                {this.getListContents()}
              </ul>
            )
            :
            <ComingSoon />
          )
        }
      </div>
    );
  }
}