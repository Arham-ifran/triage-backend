var mongoose = require('mongoose');

const DeveloperRolesSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, lowercase: true, unique: true },

        /**  system permissions **/

        // dashboard
        viewDashboard: { type: Boolean, default: false },

        // game records
        addGame: { type: Boolean, default: false },
        editGame: { type: Boolean, default: false },
        deleteGame: { type: Boolean, default: false },
        viewGame: { type: Boolean, default: false },

        // users records
        addUser: { type: Boolean, default: false },
        editUser: { type: Boolean, default: false },
        deleteUser: { type: Boolean, default: false },
        viewUsers: { type: Boolean, default: false },

        // contact
        viewContact: { type: Boolean, default: false },
        editContact: { type: Boolean, default: false },

        // activity
        viewActivity: { type: Boolean, default: false },

        // settings
        editSetting: { type: Boolean, default: false },
        viewSetting: { type: Boolean, default: false },

        // status (i.e: true for active & false for in-active)
        status: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);

DeveloperRolesSchema.index({ identityNumber: 'title' });

module.exports = mongoose.model("DeveloperRoles", DeveloperRolesSchema);
