var app = angular.module('TaskManagerApp', ['ngRoute']);

app.run(($rootScope) => {
    $rootScope.loggedIn = false;
    $rootScope.appTitle = "Task Manager";

    $rootScope.emailRegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    $rootScope.passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    
    $rootScope.serverUrl = 'http://localhost:5000';
    $rootScope.appUrl = 'http://127.0.0.1:5500/index.html';
    
    if(sessionStorage.getItem('access_token')){
        $rootScope.loggedIn = true;
        token = JSON.parse(sessionStorage.getItem('access_token'));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
});

app.config(($routeProvider) => {
    $routeProvider
        .when('/login', {
            templateUrl: 'Views/login.html',
            controller: 'authCtrl',
        })
        .when('/register', {
            templateUrl: 'Views/register.html',
            controller: 'authCtrl'
        })
        .when('/tasks', {
            templateUrl: 'Views/tasks.html',
            controller: 'taskCtrl',
        })
        .when('/calendar', {
            templateUrl: 'Views/calendar.html',
            controller: 'calendarCtrl',
        })
        .when('/statistics', {
            templateUrl: 'Views/stats.html',
            controller: 'statCtrl',
        })
        .otherwise({
            redirectTo: '/login'
        });
    }
);