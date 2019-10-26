import React, { Component } from 'react';
import {getPost} from '../../../../shared/api/posts.js';
import './post.css';
import {Loading} from '../index.js';
import marked from 'marked';
import {default as hljs} from 'highlight.js';

export class Post extends Component {
  state = {
    post: {},
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

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  setPost (id) {
    getPost(id).then(res => {
      this.setState({
        ...this.state,
        post: res.data,
        isLoading: false
      })
    })
    .catch(err => console.log(err));
  }

  componentDidUpdate(prevProps, prevState) {
    if (hljs && !prevState.isLoading) {
      document.querySelectorAll('.post-content pre code').forEach(block => {
        hljs.highlightBlock(block);
      });
    }
  }

  componentDidMount() {
    const id = this.getId();
    this.setPost(id);
  }

  getId(router) {
    return this.props.history.location.pathname.split('/').slice(-1).pop();
  }

  render() {
    return (
      <div className="post-container">
        {
          (this.state.isLoading) ?
          <Loading /> :
          (
            <React.Fragment>
              <div>
                <h1>{this.state.post.title}</h1>
                <span>By Mark Harper on {this.getDate(this.state.post.published_date)}</span>
              </div>
              <div className="post-content" dangerouslySetInnerHTML={{__html: marked(this.state.post.content || "")}}></div>
            </React.Fragment>
          )
        }
      </div>
    );
  }
}