import './index.scss';

import $ from 'jquery';
import SceneService from './services/Scene.service';

$(document).ready(function() {
    __init__();
});

function __init__() {
    const rootEl = document.getElementById('root');
    SceneService.init(rootEl);
    SceneService.create();
}
