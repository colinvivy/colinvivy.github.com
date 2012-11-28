---
layout: post
title: Archives
section: Past

feed: atom.xml
---


{% for post in site.posts %}
<div class="hc_post_list_item">
    <p>{{ post.date | date_to_string }}</p>
    <div class="hc_post_list_item_hd">
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <a class="comments hidden" href="{{ post.url }}#disqus_thread">View Comments</a>
    </div>

    <p class="excerpt">{{ post.excerpt }}</p>
</div>
{% endfor %}
