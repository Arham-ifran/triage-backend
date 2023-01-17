var mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, lowercase: true, unique: true },

        /**  system permissions **/

        viewDashboard: { type: Boolean, default: false },

        // staff's records
        addStaff: { type: Boolean, default: false },
        editStaff: { type: Boolean, default: false },
        deleteStaff: { type: Boolean, default: false },
        viewStaff: { type: Boolean, default: false },

        // permissions
        addRole: { type: Boolean, default: false },
        editRole: { type: Boolean, default: false },
        deleteRole: { type: Boolean, default: false },
        viewRole: { type: Boolean, default: false },

        // users records
        addUser: { type: Boolean, default: false },
        editUser: { type: Boolean, default: false },
        deleteUser: { type: Boolean, default: false },
        viewUsers: { type: Boolean, default: false },

        // kycs
        viewKyc: { type: Boolean, default: false },
        editKyc: { type: Boolean, default: false },

        // AccountTier
        viewAccountTier: { type: Boolean, default: false },
        addAccountTier: { type: Boolean, default: false },
        editAccountTier: { type: Boolean, default: false },
        deleteAccountTier: { type: Boolean, default: false },

        // Criteria
        viewCriteria: { type: Boolean, default: false },
        addCriteria: { type: Boolean, default: false },
        editCriteria: { type: Boolean, default: false },
        deleteCriteria: { type: Boolean, default: false },

        // PromoCodes
        viewPromoCodes: { type: Boolean, default: false },
        addPromoCodes: { type: Boolean, default: false },
        editPromoCodes: { type: Boolean, default: false },
        deletePromoCodes: { type: Boolean, default: false },

        // stakings
        viewStaking: { type: Boolean, default: false },
        editStaking: { type: Boolean, default: false },

        // ReceiveStaking
        viewReceiveStaking: { type: Boolean, default: false },
        editReceiveStaking: { type: Boolean, default: false },

        // EmailTemplates 
        viewEmailTemplates: { type: Boolean, default: false },
        addEmailTemplates: { type: Boolean, default: false },
        editEmailTemplates: { type: Boolean, default: false },
        deleteEmailTemplates: { type: Boolean, default: false },

        //FaqCategories 
        viewFaqCategories: { type: Boolean, default: false },
        addFaqCategories: { type: Boolean, default: false },
        editFaqCategories: { type: Boolean, default: false },
        deleteFaqCategories: { type: Boolean, default: false },

        // FAQs 
        addFaq: { type: Boolean, default: false },
        editFaq: { type: Boolean, default: false },
        deleteFaq: { type: Boolean, default: false },
        viewFaqs: { type: Boolean, default: false },

        // Wallets 
        viewWallet: { type: Boolean, default: false },
        addWallet: { type: Boolean, default: false },
        editWallet: { type: Boolean, default: false },
        deleteWallet: { type: Boolean, default: false },

        // Delete Request 
        viewRequestDeletion: { type: Boolean, default: false },
        editRequestDeletion: { type: Boolean, default: false },
        deleteRequestDeletion: { type: Boolean, default: false },

        // content 
        viewContent: { type: Boolean, default: false },
        addContent: { type: Boolean, default: false },
        editContent: { type: Boolean, default: false },
        deleteContent: { type: Boolean, default: false },

        // History  
        viewHistory: { type: Boolean, default: false },

        // contact 
        viewContact: { type: Boolean, default: false },
        editContact: { type: Boolean, default: false },
        deleteContact: { type: Boolean, default: false },

        // settings 
        viewSetting: { type: Boolean, default: false },
        editSetting: { type: Boolean, default: false },

        // newsletter/subscriptions
        viewNewsLetter: { type: Boolean, default: false },

        // status (i.e: true for active & false for in-active)
        status: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);

RolesSchema.index({ identityNumber: 'title' });

module.exports = mongoose.model("Roles", RolesSchema);
