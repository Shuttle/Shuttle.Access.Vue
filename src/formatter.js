import moment from 'moment';
import configuration from './configuration';

var formatter = {
    date: function(value) {
        return moment(value).format((configuration.formats || {}).date || 'yyyy-MM-DD')
    }
}

export default formatter;